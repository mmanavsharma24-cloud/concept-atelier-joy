-- Add parent_task_id column to tasks table
ALTER TABLE tasks ADD COLUMN parent_task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE;

-- Create index for faster queries
CREATE INDEX idx_tasks_parent_task_id ON tasks(parent_task_id);

-- Add comment to explain the column
COMMENT ON COLUMN tasks.parent_task_id IS 'References parent task if this is a subtask';
