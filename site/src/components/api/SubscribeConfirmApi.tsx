import { useEffect, useState } from "react";
import RequestAndWait from "./RequestAndWait";

type ConfirmRequestParams = {
    email: string,
    token: string
}

function SubscribeConfirmApi() {
    const responseMapping = {
        "Already Verified": <p>This Email is already verified.</p>,
        "Success": <p>Success! You should receive a confirmation Email shortly.</p>,
        "Verification Failed": <p>Your token has expired. Please request a new verification Email from <a className='text-blue-500 underline' href='/unsubscribe'>here</a>.</p>
    }

    const [body, setBody] = useState<ConfirmRequestParams | null>(null);

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);

        setBody({
            email: queryParams.get('email') || '',
            token: queryParams.get('token') || ''
        });
    }, []);

    return <div className="w-full">
        <RequestAndWait endpoint="/subscribe-confirm" requestBody={body} responseMapping={responseMapping} />
    </div>
}

export default SubscribeConfirmApi;