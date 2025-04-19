import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

interface GoogleUser {
    name: string;
    email: string;
    picture: string;
    sub: string;
}

function GoogleLoginButton() {
    const navigate = useNavigate();

    const handleSuccess = (credentialResponse: any) => {
        if (credentialResponse.credential) {
            const user: GoogleUser = jwtDecode(credentialResponse.credential);

            localStorage.setItem('googleUser', JSON.stringify(user));

            let userInfo: any = localStorage.getItem('googleUser');
            console.log('Usuário logado:', JSON.parse(userInfo));

            navigate('/cursos');
        }
    }

    return (
        <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => {
                console.log('Erro ao realizar login com Google');
            }}
        />
    );
}

export default GoogleLoginButton;