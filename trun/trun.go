package main

import (
	"errors"
	"os"
	"fmt"
	"strings"

	"taskfile"

	"io/ioutil"
	"path/filepath"
)

func getTaskfilePath(root string) (string, error) {

	const FILE_NAME = "taskfile.yaml"
	var file_path string

	if _, err := os.Stat(FILE_NAME); err == nil {
		return FILE_NAME, nil
	}

	filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		if err != nil { return err; }
		if !info.IsDir() && info.Name() == FILE_NAME {
			file_path = path
			return errors.New("Found")
		}

		return nil

	})

	if file_path == "" {
		return "", errors.New("Taskfile Not Found !")
	}

	return file_path, nil
}

func showUsage() {
	fmt.Println("Usage : trun task_name [-l] [-s] [-f path/to/taskfile.yaml] [-d working_directory] [-p KEY=val ...]")
}

func argFieldEnds(arg string) (bool) {
	return strings.HasPrefix(arg, "-")
}

func getOverridenVars(argv []string, i int) (map[string]string, int) {
	var_map := make(map[string]string)

	for i < len(argv) {
		if argFieldEnds(argv[i]) {return var_map, i}
		key_val := strings.Split(argv[i], "=")
		var_map[key_val[0]] = key_val[1]
		i++
	}

	return var_map, i
} 

func main() {

	argv := os.Args[1:]
	argc := len(argv)

	if argc < 1 {
		fmt.Println("Error : incorrect number of argument !")
		showUsage()
		return
	}

	work_dir, _ := filepath.Abs(".")
	taskfile_path := ""
	task_name := ""
	verbose := true
	list_tasks := false

	var var_map map[string]string
	var err error

	// Handle arguments
	for i := 0; i < argc; i++ {
		switch argv[i] {
		case "-h", "--help":
			showUsage()
			return
		case "-l", "--list":
			list_tasks = true
		case "-d", "--work-directory":
			if !argFieldEnds(argv[i + 1]) {
				i+=1
				work_dir, err = filepath.Abs(argv[i])
				if err != nil {panic(err)}
				fmt.Println(work_dir)
			}
		case "-f", "--file":
			if !argFieldEnds(argv[i + 1]) {
				i+=1
				taskfile_path = argv[i]
			}
		case "-s", "--silent":
			verbose = false
		case "-p", "--params":
			var_map, i = getOverridenVars(argv, i + 1)
		default:
			if !argFieldEnds(argv[i]) {task_name = argv[i]}
		}
	}

	if task_name == "" && !list_tasks {
		fmt.Println("Error : please specify task name !")
		showUsage()
		return
	}

	if taskfile_path == "" {
		taskfile_path, err = getTaskfilePath(".")
		if err != nil {panic(err)}
	}

	file, err := ioutil.ReadFile(taskfile_path)
	if err != nil {panic(err)}

	tf, err := taskfile.NewTaskfile(file, work_dir, var_map)
	if err != nil {panic(err)}

	if list_tasks {
		tf.ListTasks()
		return
	}

	err = tf.ExecuteTask(task_name, !verbose)
	//if err != nil {panic(err)}

}