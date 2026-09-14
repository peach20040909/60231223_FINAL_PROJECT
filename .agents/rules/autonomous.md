# Autonomous Execution Rule

1. **Do not pause for approval**: When the user provides a task, execute all necessary file modifications, terminal build commands, and Git operations without asking for intermediate confirmation.
2. **End-to-end completion**: Complete the task fully (edit -> build -> verify -> git push) and deliver only the final consolidated summary.
3. **No unnecessary questions**: Never trigger planning mode or intermediate approvals unless strictly requested by the user.
