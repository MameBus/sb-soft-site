import { useState } from "react";
import RequestAndWait from "./RequestAndWait";

type emailRequest = {
    email: string
}

type EmailFormProps = {
    endpoint : string, // Endpoint for the api call e.g. /subscribe
    responseMapping: Record<string, React.ReactElement> // A mapping of api responses to the message to display
}

function EmailForm({
    endpoint,
    responseMapping
} : EmailFormProps) {
    const [ requestBody, setRequestBody ] = useState<emailRequest | null>(null);
    const [ waiting, setWaiting ] = useState(false);
    const [ email, setEmail ] = useState<string>("");

    function formSubmit() {
        setWaiting(true);
        console.log(`Email looks like ${email}`)
        setRequestBody({
            email: email
        });
    }

    function doneWaiting() {
        setWaiting(false);
    }

    return (
        <div>
            <form className="bg-gray-100 rounded-base p-5 w-100 mx-auto mt-10" id="subscribe-form" onSubmit={(event) => {console.log("submit hit"); event.preventDefault(); formSubmit(); }}>
                <label htmlFor="email">Email:</label><br />
                <input disabled={waiting} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight bg-white focus:outline-none focus:shadow-outline" id="email" name="email" type="email" onChange={(event) => setEmail(event.target.value)} />
                
                <br />
                <button disabled={waiting} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-10" type="submit">Subscribe</button>
            </form>

            <RequestAndWait endpoint={endpoint} requestBody={requestBody} responseMapping={responseMapping} requestDone={() => doneWaiting()} />
        </div>
    )
}

export default EmailForm;