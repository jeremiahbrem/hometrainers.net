package main

import (
	"fmt"
	"runtime/debug"

	"github.com/pulumi/pulumi-docker/sdk/v4/go/docker"
	"github.com/pulumi/pulumi-gcp/sdk/v6/go/gcp/artifactregistry"
	"github.com/pulumi/pulumi-gcp/sdk/v6/go/gcp/cloudrun"
	"github.com/pulumi/pulumi-gcp/sdk/v6/go/gcp/projects"
	"github.com/pulumi/pulumi-random/sdk/v4/go/random"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	projectId := "quiet-platform-392619"
	dnsName := "homepersonaltrainers.net"

	pulumi.Run(func(ctx *pulumi.Context) error {
		enableResourceService, _ := projects.NewService(ctx, "EnableResourceService", &projects.ServiceArgs{
			DisableDependentServices: pulumi.Bool(true),
			Project:                  pulumi.String(projectId),
			Service:                  pulumi.String("cloudresourcemanager.googleapis.com"),
		})

		enableCloudRun, _ := projects.NewService(ctx, "EnableCloudRun", &projects.ServiceArgs{
			DisableDependentServices: pulumi.Bool(true),
			Project:                  pulumi.String("quiet-platform-392619"),
			Service:                  pulumi.String("run.googleapis.com"),
		}, pulumi.DependsOn([]pulumi.Resource{enableResourceService}))

		location := "us-central1"

		uniqueString, _ := random.NewRandomString(ctx, "unique-string", &random.RandomStringArgs{
			Length:  pulumi.Int(4),
			Lower:   pulumi.Bool(true),
			Upper:   pulumi.Bool(false),
			Numeric: pulumi.Bool(true),
			Special: pulumi.Bool(false),
		})

		repoId := pulumi.Sprintf("repo-%s", uniqueString.Result)

		repository, _ := artifactregistry.NewRepository(ctx, "repository", &artifactregistry.RepositoryArgs{
			Description:  pulumi.String("Repository for container image"),
			Format:       pulumi.String("DOCKER"),
			Location:     pulumi.String(location),
			RepositoryId: repoId,
		})

		repoUrl := pulumi.Sprintf("%s-docker.pkg.dev/%s/%s", repository.Location, projectId, repository.RepositoryId)

		var gitHash = func() string {
			if info, ok := debug.ReadBuildInfo(); ok {
				for _, setting := range info.Settings {
					if setting.Key == "vcs.revision" {
						return setting.Value[0:6]
					}
				}
			}

			return ""
		}()

		var backendImageName = fmt.Sprintf("backend:%v", gitHash)

		backend, _ := docker.NewImage(ctx, "backend", &docker.ImageArgs{
			Registry:  docker.RegistryArgs{},
			ImageName: pulumi.Sprintf("%s/%s", repoUrl, backendImageName),
			Build: &docker.DockerBuildArgs{
				Context:  pulumi.String("../backend"),
				Platform: pulumi.String("linux/amd64"),
			},
		})

		backendService, _ := cloudrun.NewService(ctx, "backend-service", &cloudrun.ServiceArgs{
			Location: pulumi.String(location),
			Metadata: &cloudrun.ServiceMetadataArgs{
				Namespace: pulumi.String(projectId),
			},
			Template: &cloudrun.ServiceTemplateArgs{
				Spec: &cloudrun.ServiceTemplateSpecArgs{
					Containers: cloudrun.ServiceTemplateSpecContainerArray{
						&cloudrun.ServiceTemplateSpecContainerArgs{
							Image: backend.ImageName,
						},
					},
				},
			},
		}, pulumi.DependsOn([]pulumi.Resource{enableCloudRun}))

		cloudrun.NewIamMember(ctx, "backend-iam", &cloudrun.IamMemberArgs{
			Service:  backendService.Name,
			Location: pulumi.String(location),
			Member:   pulumi.String("allUsers"),
			Role:     pulumi.String("roles/run.invoker"),
		})

		var frontendImageName = fmt.Sprintf("frontend:%v", gitHash)

		frontend, _ := docker.NewImage(ctx, "frontend", &docker.ImageArgs{
			Registry:  docker.RegistryArgs{},
			ImageName: pulumi.Sprintf("%s/%s", repoUrl, frontendImageName),
			Build: &docker.DockerBuildArgs{
				Context:  pulumi.String("../frontend"),
				Platform: pulumi.String("linux/amd64"),
			},
		})

		frontendService, _ := cloudrun.NewService(ctx, "frontend-service", &cloudrun.ServiceArgs{
			Location: pulumi.String(location),
			Metadata: &cloudrun.ServiceMetadataArgs{
				Namespace: pulumi.String(projectId),
			},
			Template: &cloudrun.ServiceTemplateArgs{
				Spec: &cloudrun.ServiceTemplateSpecArgs{
					Containers: cloudrun.ServiceTemplateSpecContainerArray{
						&cloudrun.ServiceTemplateSpecContainerArgs{
							Image: frontend.ImageName,
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
		}, pulumi.DependsOn([]pulumi.Resource{enableCloudRun}))

		cloudrun.NewIamMember(ctx, "frontend-iam", &cloudrun.IamMemberArgs{
			Service:  frontendService.Name,
			Location: pulumi.String(location),
			Member:   pulumi.String("allUsers"),
			Role:     pulumi.String("roles/run.invoker"),
		})

		cloudrun.NewDomainMapping(ctx, "domain-mapping", &cloudrun.DomainMappingArgs{
			Location: pulumi.String(location),
			Metadata: &cloudrun.DomainMappingMetadataArgs{
				Namespace: pulumi.String(projectId),
			},
			Spec: &cloudrun.DomainMappingSpecArgs{
				RouteName: frontendService.Name,
			},
			Name: pulumi.String(dnsName),
		})

		return nil
	})
}
