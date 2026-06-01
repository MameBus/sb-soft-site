import RequestAndWait from "./RequestAndWait";

type SubscribeConfirmApiProps = {
    requestBody: any
}

function SubscribeConfirmApi({ requestBody } : SubscribeConfirmApiProps ) {
    const responseMapping = {
        "Already Verified": <p>This Email is already verified.</p>,
        "Success": <p>Success! You should receive a confirmation Email shortly.</p>,
        "Verification Failed": <p>Your token has expired. Please request a new verification Email from <a className='text-blue-500 underline' href='/unsubscribe'>here</a>.</p>
    }

    return <div className="w-full">
        <RequestAndWait endpoint="/subscribe-verify" requestBody={requestBody} requestId={1} responseMapping={responseMapping} />
    </div>
}

export default SubscribeConfirmApi;