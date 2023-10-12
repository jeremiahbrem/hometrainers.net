package services

import (
	"context"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"time"

	"cloud.google.com/go/storage"
)

type BucketServiceType interface {
	UploadImage(file multipart.File, name string) error
	DeleteImage(name string) error
}

type BucketService struct{}

func (bucketService *BucketService) UploadImage(file multipart.File, name string) error {
	ctx := context.Background()
	client, err := storage.NewClient(ctx)

	if err != nil {
		return fmt.Errorf("storage.NewClient: %w", err)
	}

	defer client.Close()

	ctx, cancel := context.WithTimeout(ctx, time.Second*50)

	defer cancel()

	o := client.Bucket(os.Getenv("IMAGES_BUCKET")).Object(name)

	wc := o.NewWriter(ctx)

	if _, err = io.Copy(wc, file); err != nil {
		return err
	}

	if err := wc.Close(); err != nil {
		return err
	}

	return nil
}

func (bucketService *BucketService) DeleteImage(name string) error {
	ctx := context.Background()

	client, err := storage.NewClient(ctx)
	if err != nil {
		return fmt.Errorf("storage.NewClient: %w", err)
	}

	defer client.Close()

	ctx, cancel := context.WithTimeout(ctx, time.Second*50)
	defer cancel()

	o := client.Bucket(os.Getenv("IMAGES_BUCKET")).Object(name)

	if err := o.Delete(ctx); err != nil {
		return err
	}

	return nil
}
