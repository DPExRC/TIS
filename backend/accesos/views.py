from firebase_admin import auth, firestore
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from firebase_config import db




class LoginView(APIView):
    def post(self, request):
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return Response({"error": "Token no proporcionado"}, status=status.HTTP_401_UNAUTHORIZED)

        token = auth_header.split(" ")[1]


        try:
            decoded_token = auth.verify_id_token(token)
            uid = decoded_token["uid"]
            email = decoded_token.get("email")

            return Response({"mensaje": "Autenticado", "uid": uid, "email": email}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": "Token inválido o expirado"}, status=status.HTTP_401_UNAUTHORIZED)



class RegisterView(APIView):
    def post(self, request):
        data = request.data
        email = data.get("email")
        password = data.get("password")
        display_name = data.get("display_name", "")

        if not email or not password:
            return Response({"error": "Email y contraseña son requeridos"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = auth.create_user(email=email, password=password, display_name=display_name)

            db.collection("users").document(user.uid).set({
                "uid": user.uid,
                "email": email,
                "display_name": display_name,
                "created_at": firestore.SERVER_TIMESTAMP
            })

            return Response({"message": "Usuario registrado exitosamente", "uid": user.uid}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
