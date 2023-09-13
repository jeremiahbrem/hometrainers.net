package main

import (
	"os"

	"github.com/pulumi/pulumi-gcp/sdk/v6/go/gcp/cloudrun"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func SetEnv(name string, value string) cloudrun.ServiceTemplateSpecContainerEnvArgs {
	return cloudrun.ServiceTemplateSpecContainerEnvArgs{
		Name:      pulumi.String(name),
		Value:     pulumi.String(os.Getenv(value)),
		ValueFrom: nil,
	}
}

var Location = "us-central1"

var ProjectId = "home-trainers"
