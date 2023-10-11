package main

import (
	"github.com/pulumi/pulumi-gcp/sdk/v6/go/gcp/storage"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func Bucket(
	ctx *pulumi.Context,
) {
	bucket, _ := storage.NewBucket(ctx, "hometrainers-images", &storage.BucketArgs{
		ForceDestroy:             pulumi.Bool(true),
		Location:                 pulumi.String("US"),
		UniformBucketLevelAccess: pulumi.Bool(true),
	})

	storage.NewBucketIAMBinding(ctx, "binding", &storage.BucketIAMBindingArgs{
		Bucket: bucket.Name,
		Role:   pulumi.String("roles/storage.objectViewer"),
		Members: pulumi.StringArray{
			pulumi.String("allUsers"),
		},
	})
}
