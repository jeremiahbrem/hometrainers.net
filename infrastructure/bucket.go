package main

import (
	"github.com/pulumi/pulumi-gcp/sdk/v6/go/gcp/storage"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func Bucket(
	ctx *pulumi.Context,
) pulumi.StringOutput {
	bucket, _ := storage.NewBucket(ctx, "hometrainers-images", &storage.BucketArgs{
		Cors: storage.BucketCorArray{
			&storage.BucketCorArgs{
				MaxAgeSeconds: pulumi.Int(3600),
				Methods: pulumi.StringArray{
					pulumi.String("GET"),
				},
				Origins: pulumi.StringArray{
					pulumi.String("http://localhost:3000"),
					pulumi.String("https://hometrainers.net"),
				},
				ResponseHeaders: pulumi.StringArray{
					pulumi.String("*"),
				},
			},
		},
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

	return bucket.Name
}
