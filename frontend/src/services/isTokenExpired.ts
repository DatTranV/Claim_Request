import { jwtDecode } from "jwt-decode";

export default function isTokenExpired(token: string) {
    try {
        const decode = jwtDecode(token);
        if (decode.exp) {
            return decode.exp * 1000 < Date.now();
        }
    } catch (error) {
        console.log(error);
    }

    return true;
}
