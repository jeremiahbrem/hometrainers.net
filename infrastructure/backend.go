package main

import (
	"fmt"

	"github.com/pulumi/pulumi-docker/sdk/v4/go/docker"
	"github.com/pulumi/pulumi-gcp/sdk/v6/go/gcp/cloudrun"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func BackendService(
	gitHash string,
	ctx *pulumi.Context,
	repoUrl pulumi.StringOutput,
	dependsOn []pulumi.Resource,
	dbUser pulumi.StringOutput,
	dbPwd pulumi.StringOutput,
	dbHost pulumi.StringOutput,
	bucketName pulumi.StringOutput,
) *cloudrun.Service {
	var backendImageName = fmt.Sprintf("backend:%v", gitHash)

	backend, _ := docker.NewImage(ctx, "backend", &docker.ImageArgs{
		Registry:  docker.RegistryArgs{},
		ImageName: pulumi.Sprintf("%s/%s", repoUrl, backendImageName),
		Build: &docker.DockerBuildArgs{
			Context:  pulumi.String("../backend"),
			Platform: pulumi.String("linux/amd64"),
		},
	}, pulumi.DependsOn(dependsOn))

	backendService, _ := cloudrun.NewService(ctx, "backend-service", &cloudrun.ServiceArgs{
		Location: pulumi.String(Location),
		Metadata: &cloudrun.ServiceMetadataArgs{
			Namespace: pulumi.String(ProjectId),
		},
		Template: &cloudrun.ServiceTemplateArgs{
			Spec: &cloudrun.ServiceTemplateSpecArgs{
				Containers: cloudrun.ServiceTemplateSpecContainerArray{
					&cloudrun.ServiceTemplateSpecContainerArgs{
						Image: backend.ImageName,
						Envs: cloudrun.ServiceTemplateSpecContainerEnvArray{
							SetEnv("GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_ID"),
							SetEnv("GOOGLE_CLIENT_SECRET", "GOOGLE_CLIENT_SECRET"),
							SetEnv("AUTH_SERVER_URL", "AUTH_SERVER_URL"),
							SetEnv("BACKEND_REDIRECT_URL", "BACKEND_REDIRECT_URL"),
							SetEnv("CODE_CHALLENGE", "CODE_CHALLENGE"),
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
								Value:     pulumi.String("hptrainers"),
								ValueFrom: nil,
							},
							cloudrun.ServiceTemplateSpecContainerEnvArgs{
								Name:      pulumi.String("IMAGES_BUCKET"),
								Value:     bucketName,
								ValueFrom: nil,
							},
							cloudrun.ServiceTemplateSpecContainerEnvArgs{
								Name:      pulumi.String("ENVIRONMENT"),
								Value:     pulumi.String("PROD"),
								ValueFrom: nil,
							},
						},
					},
				},
			},
		},
	}, pulumi.DependsOn(dependsOn))

	cloudrun.NewIamMember(ctx, "backend-iam", &cloudrun.IamMemberArgs{
		Service:  backendService.Name,
		Location: pulumi.String(Location),
		Member:   pulumi.String("allUsers"),
		Role:     pulumi.String("roles/run.invoker"),
	}, pulumi.DependsOn([]pulumi.Resource{backendService}))

	return backendService
}
