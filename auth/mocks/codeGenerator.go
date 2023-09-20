package mocks

type MockCodeGenerator struct {
	Code string
}

func (codeGen *MockCodeGenerator) GenCode() string {
	return codeGen.Code
}
