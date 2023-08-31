package main

import (
	"fmt"

	"github.com/pulumi/pulumi-gcp/sdk/v6/go/gcp/cloudrun"
	"github.com/pulumi/pulumi-gcp/sdk/v6/go/gcp/dns"
	"github.com/pulumi/pulumi-gcp/sdk/v6/go/gcp/projects"
	"github.com/pulumi/pulumi/sdk/v3/go/pulumi"
)

func Dns(
	ctx *pulumi.Context,
	enableResourceService *projects.Service,
	authService *cloudrun.Service,
	backendService *cloudrun.Service,
	frontendService *cloudrun.Service,
) error {
	dnsName := "homepersonaltrainers.net"

	enableCloudDns, _ := projects.NewService(ctx, "EnableCloudDns", &projects.ServiceArgs{
		DisableDependentServices: pulumi.Bool(true),
		Project:                  pulumi.String("quiet-platform-392619"),
		Service:                  pulumi.String("dns.googleapis.com"),
	}, pulumi.DependsOn([]pulumi.Resource{enableResourceService}))

	zone, _ := dns.NewManagedZone(ctx, "backend-zone", &dns.ManagedZoneArgs{
		Description: pulumi.String("Home personal trainers api zone"),
		DnsName:     pulumi.String(dnsName + "."),
	}, pulumi.DependsOn([]pulumi.Resource{enableCloudDns}))

	backendCname, backendRecordSetError := dns.NewRecordSet(ctx, "backend-record-set", &dns.RecordSetArgs{
		Name: zone.DnsName.ApplyT(func(dnsName string) (string, error) {
			return fmt.Sprintf("api.%v", dnsName), nil
		}).(pulumi.StringOutput),
		Type:        pulumi.String("CNAME"),
		Ttl:         pulumi.Int(300),
		ManagedZone: zone.Name,
		Rrdatas:     pulumi.StringArray{pulumi.String("ghs.googlehosted.com.")},
	})

	if backendRecordSetError != nil {
		return backendRecordSetError
	}

	authCname, authRecordSetError := dns.NewRecordSet(ctx, "auth-record-set", &dns.RecordSetArgs{
		Name: zone.DnsName.ApplyT(func(dnsName string) (string, error) {
			return fmt.Sprintf("auth.%v", dnsName), nil
		}).(pulumi.StringOutput),
		Type:        pulumi.String("CNAME"),
		Ttl:         pulumi.Int(300),
		ManagedZone: zone.Name,
		Rrdatas:     pulumi.StringArray{pulumi.String("ghs.googlehosted.com.")},
	})

	if authRecordSetError != nil {
		return authRecordSetError
	}

	_, txtError := dns.NewRecordSet(ctx, "backend-txt-verification", &dns.RecordSetArgs{
		Name:        zone.DnsName,
		Type:        pulumi.String("TXT"),
		Ttl:         pulumi.Int(300),
		ManagedZone: zone.Name,
		Rrdatas:     pulumi.StringArray{pulumi.String("google-site-verification=OzbgLfozFr5wH4fsuaYt0D1Zpf2DJ01FLzLfASiEQuM")},
	})

	if txtError != nil {
		return txtError
	}

	cloudrun.NewDomainMapping(ctx, "domain-mapping", &cloudrun.DomainMappingArgs{
		Location: pulumi.String(Location),
		Metadata: &cloudrun.DomainMappingMetadataArgs{
			Namespace: pulumi.String(ProjectId),
		},
		Spec: &cloudrun.DomainMappingSpecArgs{
			RouteName: frontendService.Name,
		},
		Name: pulumi.String(dnsName),
	})

	_, apiMapError := cloudrun.NewDomainMapping(ctx, "api-mapping", &cloudrun.DomainMappingArgs{
		Location: pulumi.String(Location),
		Metadata: &cloudrun.DomainMappingMetadataArgs{
			Namespace: pulumi.String(ProjectId),
		},
		Spec: &cloudrun.DomainMappingSpecArgs{
			RouteName: backendService.Name,
		},
		Name: backendCname.Name.ApplyT(func(cname string) (string, error) {
			return cname[:len(cname)-1], nil
		}).(pulumi.StringOutput),
	})

	if apiMapError != nil {
		return apiMapError
	}

	_, authMapError := cloudrun.NewDomainMapping(ctx, "auth-mapping", &cloudrun.DomainMappingArgs{
		Location: pulumi.String(Location),
		Metadata: &cloudrun.DomainMappingMetadataArgs{
			Namespace: pulumi.String(ProjectId),
		},
		Spec: &cloudrun.DomainMappingSpecArgs{
			RouteName: authService.Name,
		},
		Name: authCname.Name.ApplyT(func(cname string) (string, error) {
			return cname[:len(cname)-1], nil
		}).(pulumi.StringOutput),
	})

	if authMapError != nil {
		return authMapError
	}

	return nil
}
