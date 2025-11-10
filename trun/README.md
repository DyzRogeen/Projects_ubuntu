# trun

trun is a simple task runner written in Golang. The execution configuration are detailed in a YAML file that trun will exploit.

**_Warning_**: The task file must be named 'taskfile.yaml' in lowcase to be used by trun.

## Usage

```shell
trun task_name [-l] [-s] [-f path/to/taskfile.yaml] [-d working_directory] [-p KEY=val ...]
```

**task_name** : Specifies the name of the task to be executed. Mandatory unless -l option is specified in which case it is ignored.

**-l, --list** : Lists all specified tasks in the taskfile and their description.

**-s, --silent** : Forces trun not to log any output except errors.

**-f, --file** : Specifies the path of wanted taskfile. If not present, trun will search the taskfile in the current directory by default.

**-d, --work-directory** : Specifies the directory in which the user wants the tasks to be excecuted. If not present, the current directory is set by default.

**-p, --params** : Lists the custom variables the user wants to add / override.

## Structure of a taskfile.yaml

Template of a taskile.yaml
```yaml
---
vars: # Optionnal, you can specify local variable to sustain maintenability
  VAR_ONE: "value 1"
  VAR_TWO: "value 2"
tasks:
    # The name is the task's identifier, it must be unique in a task file and must not contain spaces (to be launched with a command).
  - name: "some-task-name"
    # You can briefly describe a task overall purpose.
    desc: "Some task description"
    # A task have a list of steps that will be executed one by one.
    steps:
        # Comment a step to help understanding what's going on.
        # Comments are displayed during excecution unless the '--silent' argument is used.
      - com: "Comment of a step"
        # Command line, local variables between brackets will be replaced during execution
        cmd: "echo \"{{VAR_ONE}}\" > foo.txt" # 
      - cmd: "sleep 1"
      - com: "Comments without commands are possible, as well as commands alone."
        # If you want to prevent a command to log anything, set 'silent' to true
      - com: "A silent step, the output of this command will not be displayed"
        cmd: "ping 8.8.8.8 -c 3"
        silent: true
        # You can call another task by using the 'call' key with the name of the task you want to call.
      - com: "Calling another task"
        call: "some-other-task"
    # If a step exits with an error, the task's status will be in failure and will stop
    # You can specify a list of steps to execute if an error occurs with the 'onFail' key
    # This, for instance, can be useful for rollback / cleaning purposes
    onFail:
      - com: "This step is executed if a problem occured"
        cmd: "rm ./{{VAR_TWO}}"
  - name: "some-other-task"
    steps:
      - com: "Some other step"
        cmd: "cat ./{{VAR_TWO}}"
```

```go
// Structures of a taskfile in Go

type Taskfile struct {
	Vars map[string]string
	Tasks []Task
}

type Task struct {
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
```