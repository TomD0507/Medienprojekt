//ein Task element
type Priority = "low" | "medium" | "high";//prioritätet
type Subtask = {
    name: string;
    done: boolean;
  };
  //argumente, die ein taskelement haben kann
interface TaskProps{
    id:string;
    title:string;
    description:string;
    subtasks:Subtask[];
    deadline:Date;
    priority:Priority;
    done: boolean;
    //reminder: keine ahnung wie ich den darstelle/welcher type
}
function Task(props: TaskProps){
    if (props.done){
        return <h1>Done</h1>
    }
    if (props.deadline< new Date()){
        return <h1>overtime</h1>
    }
    return <h1>still to do</h1>
}