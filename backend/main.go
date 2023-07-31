package main

import (
	"fmt"
	"log"
	"os/exec"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	cmd := exec.Command("sh", "-c", "git rev-parse --short HEAD")
	out, _ := cmd.Output()

	fmt.Println("Output: ", string(out))
	r.GET("/api", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})
	r.Run(":8080")

	log.Println("Server is available at http://localhost:8080")
}
