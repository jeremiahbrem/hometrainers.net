package main

import (
	"fmt"

	"github.com/pulumi/pulumi-docker/sdk/v4/go/docker"
	"github.com/pulumi/pulumi-gcp/sdk/v6/go/gcp/cloudrun"
	"github.com/pulumi/pulumi-gcp/sdk/v6/go/gcp/projects"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func AuthService(
	gitHash string,
	ctx *pulumi.Context,
	repoUrl pulumi.StringOutput,
	enableCloudRun *projects.Service,
	enableSqlAdmin *projects.Service,
	dbUser pulumi.StringOutput,
	dbPwd pulumi.StringOutput,
	dbHost pulumi.StringOutput,
) *cloudrun.Service {
	var authImageName = fmt.Sprintf("auth:%v", gitHash)

	auth, _ := docker.NewImage(ctx, "auth", &docker.ImageArgs{
		Registry:  docker.RegistryArgs{},
		ImageName: pulumi.Sprintf("%s/%s", repoUrl, authImageName),
		Build: &docker.DockerBuildArgs{
			Context:  pulumi.String("../auth"),
			Platform: pulumi.String("linux/amd64"),
		},
	}, pulumi.DependsOn([]pulumi.Resource{enableCloudRun, enableSqlAdmin}))

	authService, _ := cloudrun.NewService(ctx, "auth-service", &cloudrun.ServiceArgs{
		Location: pulumi.String(Location),
		Metadata: &cloudrun.ServiceMetadataArgs{
			Namespace: pulumi.String(ProjectId),
			Annotations: pulumi.StringMap(
				map[string]pulumi.StringInput{
					"run.googleapis.co/cloudsql-instances": dbHost,
				},
			),
		},
		Template: &cloudrun.ServiceTemplateArgs{
			Spec: &cloudrun.ServiceTemplateSpecArgs{
				Containers: cloudrun.ServiceTemplateSpecContainerArray{
					&cloudrun.ServiceTemplateSpecContainerArgs{
						Image: auth.ImageName,
						Envs: cloudrun.ServiceTemplateSpecContainerEnvArray{
							SetEnv("NEXTAUTH_URL", "NEXTAUTH_URL"),
							SetEnv("MAIL_PASSWORD", "MAIL_PASSWORD"),
							SetEnv("CLIENT_ID", "CLIENT_ID"),
							SetEnv("CLIENT_SECRET", "CLIENT_SECRET"),
							cloudrun.ServiceTemplateSpecContainerEnvArgs{
								Name:      pulumi.String("POSTGRES_USER"),
								Value:     dbUser,
								ValueFrom: nil,
							},
							cloudrun.ServiceTemplateSpecContainerEnvArgs{
								Name:      pulumi.String("POSTGRES_PASSWORD"),
								Value:     dbPwd,
								ValueFrom: nil,
							},
							cloudrun.ServiceTemplateSpecContainerEnvArgs{
								Name:      pulumi.String("POSTGRES_HOST"),
								Value:     dbHost,
								ValueFrom: nil,
							},
							cloudrun.ServiceTemplateSpecContainerEnvArgs{
								Name:      pulumi.String("POSTGRES_DB"),
								Value:     pulumi.String("auth"),
								ValueFrom: nil,
							},
							cloudrun.ServiceTemplateSpecContainerEnvArgs{
								Name:      pulumi.String("ENVIRONMENT"),
								Value:     pulumi.String("PROD"),
								ValueFrom: nil,
							},
						},
						Ports: cloudrun.ServiceTemplateSpecContainerPortArray{
							cloudrun.ServiceTemplateSpecContainerPortArgs{
								ContainerPort: pulumi.IntPtr(9096),
							},
						},
					},
				},
			},
		},
	}, pulumi.DependsOn([]pulumi.Resource{enableCloudRun, enableSqlAdmin, auth}))

	cloudrun.NewIamMember(ctx, "auth-iam", &cloudrun.IamMemberArgs{
		Service:  authService.Name,
		Location: pulumi.String(Location),
		Member:   pulumi.String("allUsers"),
		Role:     pulumi.String("roles/run.invoker"),
	}, pulumi.DependsOn([]pulumi.Resource{authService}))

	return authService
}
