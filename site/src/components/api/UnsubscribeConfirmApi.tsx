import RequestAndWait from "./RequestAndWait";

type UnsubscribeConfirmApiProps = {
    requestBody: any
}

function UnsubscribeConfirmApi({ requestBody } : UnsubscribeConfirmApiProps ) {
    const responseMapping = {
        "Success": <p>Success! You are now unsubscribed.</p>,
        "Verification Failed": <p>Your token has expired. Please request a new verification Email from <a className='text-blue-500 underline' href='/unsubscribe'>here</a>.</p>
    }

    return <div className="w-full">
        <RequestAndWait endpoint="/unsubscribe-verify" requestBody={requestBody} requestId={1} responseMapping={responseMapping} />
    </div>
}

export default UnsubscribeConfirmApi;