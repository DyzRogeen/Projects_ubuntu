package taskfile

import (
	"fmt"
	"strings"
	"os/exec"
)

type Task struct {
	_taskfile Taskfile
	Name string `yaml:"name"`
	Desc string `yaml:"desc"`
	Steps []Step `yaml:"steps"`
	OnFailSteps []Step `yaml:"onFail"`
	Silent bool `yaml:"silent"`
}

type Step struct {
	Com string `yaml:"com"`
	Cmd string `yaml:"cmd"`
	Call string `yaml:"call"`
	Silent bool `yaml:"silent"`
}

func (task *Task) Execute() error {
	work_dir := task._taskfile.work_dir
	task_name := task.Name
	verbose := !task.Silent

	if verbose {
		fmt.Printf("| \033[33mWorking Directory : %s \033[0m\n", work_dir)
		if task.Desc != "" {fmt.Printf("[\033[35m %s \033[0m] \033[34m%s\033[0m\n", task_name, task.Desc)}
	}

	for _, step := range task.Steps {

		err := executeStep(step, *task, verbose)
	
		if err == nil {continue}

		// On Failure
		if len(task.OnFailSteps) < 1 {
			if verbose {printStatus(1, task_name)}
			return err
		}

		// Runs onFail steps
		if verbose {fmt.Printf("=== ON FAIL STEPS ===\n[\033[35m %s \033[0m] : Task failed, executing onFail steps.\n", task_name)}
		for _, onFailStep := range task.OnFailSteps {
			err2 := executeStep(onFailStep, *task, verbose)

			if err2 == nil {continue}

			if verbose {fmt.Printf("[\033[35m %s \033[0m] : onFail steps failed.\n", task_name)}

			break
		}

		fmt.Println("=====================")
		if verbose {printStatus(1, task_name)}

		return err
	}

	if verbose {printStatus(0, task_name)}

	return nil
}

func executeStep(step Step, task Task, verbose bool) error {

	task_name := string(task.Name)

	if verbose && len(step.Com) > 0 {
		fmt.Printf("[\033[35m %s \033[0m] : \033[36m%s\033[0m\n", task_name, step.Com)
	}

	// Calling another task
	if step.Call != "" {
		verbose = verbose && !step.Silent  
		if verbose {fmt.Printf("\n===== Calling Task '%s' =====\n", step.Call)}
		err := task._taskfile.ExecuteTask(step.Call, !verbose)
		if verbose {fmt.Printf("===== End Of Task  '%s' =======\n\n", step.Call)}
		return err
	}

	if step.Cmd == "" {return nil}

	cmdStr := formatStr(step.Cmd, task._taskfile.Vars)
	if verbose {fmt.Printf("[\033[35m %s \033[0m] : \033[38m%s\033[0m\n", task_name, cmdStr)}

	// Command execution
	cmd := exec.Command("bash", "-c", cmdStr)
	cmd.Dir = task._taskfile.work_dir
	out, err := cmd.CombinedOutput()

	// Error behaviour
	if err != nil {
		outStr := handleMultipleLinesOutput(string(out))
		fmt.Printf("[\033[35m %s \033[0m] : [\033[31mError\033[0m] Executing command '%s'.\n", task_name, cmdStr)
		fmt.Printf("[\033[35m %s \033[0m] : [\033[31mError\033[0m] %s\n", task_name, outStr)
		return err
	}

	// Normal behaviour
	if verbose && len(out) > 0 && !step.Silent {
		outStr := handleMultipleLinesOutput(string(out))
		fmt.Printf("[\033[35m %s \033[0m] : [\033[33mLog\033[0m] : %s\n", task_name, outStr)
	}

	return nil

}

// Utils
func handleMultipleLinesOutput(out string) string {
	out = out[:len(out)-1]
	if strings.Contains(out, "\n") {return "\n" + out}
	return out
}

func printStatus(status int, task_name string) {
	if status == 1 {
		fmt.Printf("[\033[35m %s \033[0m] \033[31mSTATUS FAILED\033[0m\n", task_name)
		return
	}
	fmt.Printf("[\033[35m %s \033[0m] \033[32mSTATUS SUCCESS\033[0m\n", task_name)
}

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