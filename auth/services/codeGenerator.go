package services

import (
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"math/rand"
)

type CodeGeneratorType interface {
	GenCode() string
}

type CodeGenerator struct{}

func (gen *CodeGenerator) GenCode() string {
	s256 := sha256.Sum256([]byte(fmt.Sprint(rand.Int())))
	return base64.URLEncoding.EncodeToString(s256[:])
}
