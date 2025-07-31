import React from "react";
import "./Message.css"

function Message(props) {

    return (
        <div className='notification-message-body'>
            {props.text}
        </div>
    )
}

export default Message