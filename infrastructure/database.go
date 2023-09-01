package main

import (
	"github.com/pulumi/pulumi-gcp/sdk/v6/go/gcp/projects"
	"github.com/pulumi/pulumi-gcp/sdk/v6/go/gcp/sql"
	"github.com/pulumi/pulumi-random/sdk/v4/go/random"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func Database(
	ctx *pulumi.Context,
) (
	pulumi.StringOutput,
	pulumi.StringOutput,
	pulumi.StringOutput,
	*sql.Database,
	error,
) {
	enableSqlAdmin, _ := projects.NewService(ctx, "EnableSqlAdmin", &projects.ServiceArgs{
		DisableDependentServices: pulumi.Bool(true),
		Project:                  pulumi.String(ProjectId),
		Service:                  pulumi.String("sqladmin.googleapis.com"),
	})

	instance, err := sql.NewDatabaseInstance(ctx, "instance", &sql.DatabaseInstanceArgs{
		Region:          pulumi.String("us-central1"),
		DatabaseVersion: pulumi.String("POSTGRES_14"),
		Settings: &sql.DatabaseInstanceSettingsArgs{
			Tier: pulumi.String("db-f1-micro"),
		},
		DeletionProtection: pulumi.Bool(true),
	}, pulumi.DependsOn([]pulumi.Resource{enableSqlAdmin}))

	emptyString := pulumi.String("").ToStringOutput()

	if err != nil {
		return emptyString, emptyString, emptyString, nil, err
	}
	_, err = sql.NewDatabase(ctx, "database", &sql.DatabaseArgs{
		Instance: instance.Name,
	})
	if err != nil {
		return emptyString, emptyString, emptyString, nil, err
	}

	password, _ := random.NewRandomPassword(ctx, "hpt-db-password", &random.RandomPasswordArgs{
		Length:  pulumi.Int(32),
		Lower:   pulumi.Bool(true),
		Upper:   pulumi.Bool(true),
		Special: pulumi.Bool(false),
		Number:  pulumi.Bool(true),
	})

	user, _ := sql.NewUser(ctx, "hpt-user", &sql.UserArgs{
		Instance: instance.Name,
		Name:     pulumi.String("hpt-user"),
		Password: password.Result,
	})

	db, _ := sql.NewDatabase(ctx, "hptrainers", &sql.DatabaseArgs{
		Instance: instance.Name,
		Name:     pulumi.String("hptrainers"),
	})

	return user.Name, password.Result, instance.ConnectionName, db, err
}
