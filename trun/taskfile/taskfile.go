package taskfile

import (
	"errors"
	"fmt"

	"gopkg.in/yaml.v2"
)

type Taskfile struct {
	Vars map[string]string `yaml:"vars"`
	Tasks []Task `yaml:"tasks"`
	work_dir string
}

func NewTaskfile(file []byte, work_dir string, var_map map[string]string) (Taskfile, error) {
	var taskf Taskfile
	err := yaml.Unmarshal(file, &taskf)
	if err != nil {return Taskfile{}, err}

	taskf.work_dir = work_dir

	// Add / Override Variables
	for key, val := range(var_map) {
		taskf.Vars[key] = val
	}

	return taskf, nil
}

func (tf *Taskfile) ListTasks() {
	fmt.Println("List of available tasks :")
	for _, task := range tf.Tasks {
		fmt.Printf(" - \033[35m %s \033[0m", task.Name)
		if task.Desc != "" {fmt.Printf("\t\t: \033[34m%s\033[0m", task.Desc)}
		fmt.Printf("\n")
	}
}

func (tf *Taskfile) ExecuteTask(task_name string, silent bool) error {
	task, e := tf.findTaskWithName(task_name)
	if e != nil {
		fmt.Println(e)
		return e
	}

	task._taskfile = *tf
	if silent {task.Silent = true}

	e = task.Execute()
	if e != nil {return e}

	return nil
}

func (tf *Taskfile) findTaskWithName(task_name string) (Task, error) {
	for _, task := range tf.Tasks {
		if task.Name == task_name {return task, nil}
	}
	return Task{}, errors.New(fmt.Sprintf("No Task with name '%s' found !\nUse 'trun -l' to list available tasks.", task_name))
}