package main

import (
	"fmt"
	"os"

	"github.com/pulumi/pulumi-docker/sdk/v4/go/docker"
	"github.com/pulumi/pulumi-gcp/sdk/v6/go/gcp/cloudrun"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func FrontendService(
	gitHash string,
	ctx *pulumi.Context,
	repoUrl pulumi.StringOutput,
	dependsOn []pulumi.Resource,
) *cloudrun.Service {
	var frontendImageName = fmt.Sprintf("frontend:%v", gitHash)

	var frontendArgs = make(map[string]pulumi.StringInput)
	frontendArgs["NEXTAUTH_URL"] = pulumi.String(os.Getenv("NEXTAUTH_URL"))
	frontendArgs["NEXTAUTH_SECRET"] = pulumi.String(os.Getenv("NEXTAUTH_SECRET"))
	frontendArgs["NEXT_PUBLIC_GOOGLE_CLIENT_SECRET"] = pulumi.String(os.Getenv("GOOGLE_CLIENT_SECRET"))
	frontendArgs["NEXT_PUBLIC_GOOGLE_CLIENT_ID"] = pulumi.String(os.Getenv("GOOGLE_CLIENT_ID"))
	frontendArgs["NEXT_PUBLIC_API_URL"] = pulumi.String(os.Getenv("API_URL"))
	frontendArgs["ENVIRONMENT"] = pulumi.String("PROD")

	frontend, _ := docker.NewImage(ctx, "frontend", &docker.ImageArgs{
		Registry:  docker.RegistryArgs{},
		ImageName: pulumi.Sprintf("%s/%s", repoUrl, frontendImageName),
		Build: &docker.DockerBuildArgs{
			Context:  pulumi.String("../frontend"),
			Platform: pulumi.String("linux/amd64"),
			Args:     pulumi.StringMap(frontendArgs),
		},
	}, pulumi.DependsOn(dependsOn))

	dependencies := append([]pulumi.Resource{frontend}, dependsOn...)

	frontendService, _ := cloudrun.NewService(ctx, "frontend-service", &cloudrun.ServiceArgs{
		Location: pulumi.String(Location),
		Metadata: &cloudrun.ServiceMetadataArgs{
			Namespace: pulumi.String(ProjectId),
		},
		Template: &cloudrun.ServiceTemplateArgs{
			Spec: &cloudrun.ServiceTemplateSpecArgs{
				Containers: cloudrun.ServiceTemplateSpecContainerArray{
					&cloudrun.ServiceTemplateSpecContainerArgs{
						Image: frontend.ImageName,
						Envs: cloudrun.ServiceTemplateSpecContainerEnvArray{
							SetEnv("NEXT_PUBLIC_GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_ID"),
							SetEnv("NEXT_PUBLIC_GOOGLE_CLIENT_SECRET", "GOOGLE_CLIENT_SECRET"),
							SetEnv("NEXT_PUBLIC_API_URL", "API_URL"),
							SetEnv("NEXTAUTH_URL", "NEXTAUTH_URL"),
							SetEnv("NEXT_PUBLIC_LOGIN_URL", "LOGIN_URL"),
							SetEnv("NEXT_PUBLIC_AUTH_SERVER", "AUTH_SERVER_URL"),
							SetEnv("NEXTAUTH_SECRET", "NEXTAUTH_SECRET"),
						},
					},
				},
			},
		},
		Traffics: cloudrun.ServiceTrafficArray{
			&cloudrun.ServiceTrafficArgs{
				Percent:        pulumi.Int(100),
				LatestRevision: pulumi.Bool(true),
			},
		},
	}, pulumi.DependsOn(dependencies))

	cloudrun.NewIamMember(ctx, "frontend-iam", &cloudrun.IamMemberArgs{
		Service:  frontendService.Name,
		Location: pulumi.String(Location),
		Member:   pulumi.String("allUsers"),
		Role:     pulumi.String("roles/run.invoker"),
	}, pulumi.DependsOn([]pulumi.Resource{frontendService}))

	return frontendService
}
