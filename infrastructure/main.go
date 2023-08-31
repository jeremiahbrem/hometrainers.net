package main

import (
	"runtime/debug"

	"github.com/pulumi/pulumi-gcp/sdk/v6/go/gcp/artifactregistry"
	"github.com/pulumi/pulumi-gcp/sdk/v6/go/gcp/projects"
	"github.com/pulumi/pulumi-random/sdk/v4/go/random"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		enableResourceService, ersErr := projects.NewService(ctx, "EnableResourceService", &projects.ServiceArgs{
			DisableDependentServices: pulumi.Bool(true),
			Project:                  pulumi.String(ProjectId),
			Service:                  pulumi.String("cloudresourcemanager.googleapis.com"),
		})

		if ersErr != nil {
			return ersErr
		}

		enableCloudRun, _ := projects.NewService(ctx, "EnableCloudRun", &projects.ServiceArgs{
			DisableDependentServices: pulumi.Bool(true),
			Project:                  pulumi.String(ProjectId),
			Service:                  pulumi.String("run.googleapis.com"),
		}, pulumi.DependsOn([]pulumi.Resource{enableResourceService}))

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
			Location:     pulumi.String(Location),
			RepositoryId: repoId,
		})

		repoUrl := pulumi.Sprintf("%s-docker.pkg.dev/%s/%s", repository.Location, ProjectId, repository.RepositoryId)

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

		authService := AuthService(
			gitHash,
			ctx,
			repoUrl,
			enableCloudRun,
		)

		backendService := BackendService(
			gitHash,
			ctx,
			repoUrl,
			[]pulumi.Resource{enableCloudRun, authService},
		)

		frontendService := FrontendService(
			gitHash,
			ctx,
			repoUrl,
			[]pulumi.Resource{enableCloudRun, authService, backendService},
		)

		dnsErr := Dns(
			ctx,
			enableResourceService,
			authService,
			backendService,
			frontendService,
		)

		if dnsErr != nil {
			return dnsErr
		}

		return nil
	})
}
