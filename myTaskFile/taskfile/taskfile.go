package taskfile

import (
	"errors"
	"fmt"

	"gopkg.in/yaml.v2"
)

type Taskfile struct {
	Vars map[string]string `yaml:"vars"`
	Tasks []Task `yaml:"tasks"`
}

func NewTaskfile(file []byte, task_name string) error {
	var taskf Taskfile
	err := yaml.Unmarshal(file, &taskf)
	if err != nil {panic(err)}

	err = taskf.executeTask(task_name)
	if err != nil {panic(err)}

	return nil
}

func (tf *Taskfile) executeTask(task_name string) error {
	task, e := tf.findTaskWithName(task_name)
	if e != nil {return e}

	e = task.executeSteps(tf.Vars)
	if e != nil {return e}

	return nil
}

func (tf *Taskfile) findTaskWithName(task_name string) (Task, error) {
	for _, task := range tf.Tasks {
		if task.Name == task_name {return task, nil}
	}
	return Task{}, errors.New(fmt.Sprintf("No Task with name '%s' found !", task_name))
}