package main

import (
	"github.com/pulumi/pulumi-docker/sdk/v4/go/docker"
	"github.com/pulumi/pulumi-gcp/sdk/v6/go/gcp/cloudrun"
	"github.com/pulumi/pulumi-gcp/sdk/v6/go/gcp/projects"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func main() {
	pulumi.Run(func(ctx *pulumi.Context) error {
		enableResourceService, err := projects.NewService(ctx, "EnableResourceService", &projects.ServiceArgs{
			DisableDependentServices: pulumi.Bool(true),
			Project:                  pulumi.String("quiet-platform-392619"),
			Service:                  pulumi.String("cloudresourcemanager.googleapis.com"),
		})

		if err != nil {
			return err
		}

		enableCloudRun, err := projects.NewService(ctx, "EnableCloudRun", &projects.ServiceArgs{
			DisableDependentServices: pulumi.Bool(true),
			Project:                  pulumi.String("quiet-platform-392619"),
			Service:                  pulumi.String("run.googleapis.com"),
		}, pulumi.DependsOn([]pulumi.Resource{enableResourceService}))

		if err != nil {
			return err
		}

		enableCloudDns, err := projects.NewService(ctx, "EnableCloudDns", &projects.ServiceArgs{
			DisableDependentServices: pulumi.Bool(true),
			Project:                  pulumi.String("quiet-platform-392619"),
			Service:                  pulumi.String("run.googleapis.com"),
		}, pulumi.DependsOn([]pulumi.Resource{enableCloudRun}))

		if err != nil {
			return err
		}

		location := "us-central1"

		// 		cmd := exec.Command("git rev-parse", "-");

		// // The `Output` method executes the command and
		// // collects the output, returning its value
		// out, err := cmd.Output()
		// if err != nil {
		//   // if there was any error, print it here
		//   fmt.Println("could not run command: ", err)
		// }
		// // otherwise, print the output from running the command
		// fmt.Println("Output: ", string(out))

		frontendImage, err := docker.NewImage(ctx, "frontend", &docker.ImageArgs{
			Build: &docker.DockerBuildArgs{
				Context:    pulumi.String("."),
				Dockerfile: pulumi.String("Dockerfile"),
			},
			ImageName: pulumi.String("username/image:tag1"),
			SkipPush:  pulumi.Bool(true),
		})

		if err != nil {
			return err
		}

		frontend, err := cloudrun.NewService(ctx, "frontend", &cloudrun.ServiceArgs{
			Location: pulumi.String(location),
			Metadata: &cloudrun.ServiceMetadataArgs{
				Namespace: pulumi.String("home-personal-training"),
			},
			Template: &cloudrun.ServiceTemplateArgs{
				Spec: &cloudrun.ServiceTemplateSpecArgs{
					Containers: cloudrun.ServiceTemplateSpecContainerArray{
						&cloudrun.ServiceTemplateSpecContainerArgs{
							Image: pulumi.String("us-docker.pkg.dev/cloudrun/container/hello"),
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
		})
		if err != nil {
			return err
		}
		_, err = cloudrun.NewDomainMapping(ctx, "defaultDomainMapping", &cloudrun.DomainMappingArgs{
			Location: pulumi.String("us-central1"),
			Metadata: &cloudrun.DomainMappingMetadataArgs{
				Namespace: pulumi.String("home-personal-training"),
			},
			Spec: &cloudrun.DomainMappingSpecArgs{
				RouteName: frontend.Name,
			},
		})
		if err != nil {
			return err
		}
		return nil
	})
}
