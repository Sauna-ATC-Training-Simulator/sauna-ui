use std::path::Path;
use std::process::{Child, Command};

pub struct ChildGuard(pub Option<Child>);
impl ChildGuard {
    pub fn new() -> ChildGuard {
        ChildGuard(None)
    }

    pub fn start_child(&mut self, program_path: impl AsRef<Path>, exec_dir: Option<impl AsRef<Path>>, args: &[String]) {
        let mut command = Command::new(program_path.as_ref());
        if let Some(exec_dir) = exec_dir {
            command.current_dir(exec_dir.as_ref());
        }
        self.0 = command.args(args).spawn().ok();
    }
}

impl Drop for ChildGuard {
    fn drop(&mut self) {
        if let Some(mut child) = self.0.take() {
            match child.kill() {
                Err(e) => println!("Could not kill child process: {}", e),
                Ok(_) => println!("Successfully killed child process"),
            }
        }
    }
}