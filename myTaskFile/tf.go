package main

import (
	"errors"
	"os"

	"taskfile"

	"io/ioutil"
	"path/filepath"
)

func getTaskfilePath(root string) (string, error) {

	var file_path string

	filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		if err != nil { return err; }
		if !info.IsDir() && info.Name() == "taskfile.yaml" {
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

func main() {

	argv := os.Args[1:]
	argc := len(argv)

	work_dir := "."
	taskfile_path := ""
	task_name := ""

	for i := 0; i < argc; i++ {
		switch argv[i] {
		case "-d":
			i+=1
			work_dir = argv[i]
		case "-f":
			i+=1
			taskfile_path = argv[i]
		default:
			task_name = argv[i]
		}
	}

	if taskfile_path == "" {
		var e error
		taskfile_path, e = getTaskfilePath(work_dir)
		if e != nil {panic(e)}
	}

	file, err := ioutil.ReadFile(taskfile_path)
	if err != nil {panic(err)}

	err = taskfile.NewTaskfile(file, task_name)
	if err != nil {panic(err)}

}