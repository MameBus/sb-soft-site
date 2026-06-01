import EmailForm from "./EmailForm";

function SubscribeApi() {
    const responseMapping = {
        "Already Verified": <p>This Email already has a verified subscription.</p>,
        "Verification Sent": <p>A verification Email has been sent to you! Hit the link to verifiy your subscription, if you can't find it, please check your junk folder.</p>,
        "Unexpected Failure": <p>Something went wrong there... Please try again later.</p>
    }

    return <div className="w-full">
        <EmailForm endpoint="/subscribe" responseMapping={responseMapping}/>
    </div>
}

export default SubscribeApi;