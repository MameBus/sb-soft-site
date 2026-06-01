import EmailForm from "./EmailForm";

function UnsubscribeApi() {
    const responseMapping = {
        "Not verified": <p>This Email already isn't subscribed.</p>,
        "Success": <p>A verification Email has been sent to you! Hit the link to verifiy the cancellation of your subscription. If you can't find it, check your junk folder.</p>,
        "Unexpected Issue": <p>Something went wrong. Please try again later.</p>
    }

    return <div className="w-full">
        <EmailForm endpoint="/unsubscribe" responseMapping={responseMapping}/>
    </div>
}

export default UnsubscribeApi;