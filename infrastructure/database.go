package main

import (
	"github.com/pulumi/pulumi-gcp/sdk/v6/go/gcp/projects"
	"github.com/pulumi/pulumi-gcp/sdk/v6/go/gcp/sql"
	"github.com/pulumi/pulumi-random/sdk/v4/go/random"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func Database(
	ctx *pulumi.Context,
	enableSqlAdmin *projects.Service,
) (
	pulumi.StringOutput,
	pulumi.StringOutput,
	pulumi.StringOutput,
	error,
) {
	instance, err := sql.NewDatabaseInstance(ctx, "instance", &sql.DatabaseInstanceArgs{
		Region:          pulumi.String(Location),
		DatabaseVersion: pulumi.String("POSTGRES_14"),
		Settings: &sql.DatabaseInstanceSettingsArgs{
			Tier: pulumi.String("db-f1-micro"),
		},
		DeletionProtection: pulumi.Bool(true),
	}, pulumi.DependsOn([]pulumi.Resource{enableSqlAdmin}))

	emptyString := pulumi.String("").ToStringOutput()

	if err != nil {
		return emptyString, emptyString, emptyString, err
	}
	_, err = sql.NewDatabase(ctx, "database", &sql.DatabaseArgs{
		Instance: instance.Name,
	})
	if err != nil {
		return emptyString, emptyString, emptyString, err
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

	sql.NewDatabase(ctx, "hptrainers", &sql.DatabaseArgs{
		Instance: instance.Name,
		Name:     pulumi.String("hptrainers"),
	})

	sql.NewDatabase(ctx, "auth", &sql.DatabaseArgs{
		Instance: instance.Name,
		Name:     pulumi.String("auth"),
	})

	return user.Name, password.Result, instance.ConnectionName, err
}
