package taskfile

import (
	"fmt"
	"strings"
	"os/exec"
)

type Task struct {
	Name string `yaml:"name"`
	Steps []Step `yaml:"steps"`
}

type Step struct {
	Com string `yaml:"com"`
	Cmd string `yaml:"cmd"`
}

func (task *Task) executeSteps(vars map[string]string) error {
	task_name := string(task.Name)

	for _, step := range task.Steps {

		if len(step.Com) > 0 {
			fmt.Printf("[\033[35m %s \033[0m] : \033[36m%s\033[0m\n", task_name, string(step.Com))
		}

		cmdStr := formatStr(step.Cmd, vars)
		fmt.Printf("[\033[35m %s \033[0m] : \033[32m%s\033[0m\n", task_name, cmdStr)

		cmd := exec.Command("bash", "-c", cmdStr)
		out, err := cmd.Output()

		if len(out) > 0 {
			fmt.Printf("[\033[35m %s \033[0m] : [\033[33mLog\033[0m] : %s\n", task_name, string(out))
		}

		if err != nil {
			fmt.Printf("[\033[35m %s \033[0m] : [\033[31mError\033[0m] Executing command '%s' :\n", task_name, cmdStr)
			return err
		}
	}

	return nil
}

// Utils
func formatStr(s string, vars map[string]string) string {
	for key, val := range vars {
		varStr := buildVarStr(key)
		s = strings.Replace(s, varStr, val, -1)
	}
	return s
}

func buildVarStr(s string) string {
	return fmt.Sprintf("{{%s}}", s)
}