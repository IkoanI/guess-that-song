import "./Popup.css"

export default function Popup(props) {
    if(!props.trigger){
        return null
    }

    return (
        <div className='popupWrapper'>
            <div className='popUpContent'>
                {props.children}
                <button className="closeButton" onClick={() => props.continue()}>Continue</button>
            </div>
        </div>
    )
}
