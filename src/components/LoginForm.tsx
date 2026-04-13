import React, { useContext, useState, useRef } from "react";
import {
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { AuthContext } from "../utils/authContext";
import { FontAwesomeEye, FontAwesomeEyeOff } from "../components/Icons";

// Tipado para los datos del formulario
type FormData = {
  username: string;
  password: string;
};

export default function LoginForm() {
  const authContext = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Referencia para manejar el salto de foco al input de contraseña
  const passwordInputRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const togglePasswordView = () => setShowPassword(!showPassword);

  const onSubmit = async (data: FormData) => {
    // Cerrar teclado al enviar
    Keyboard.dismiss();
    setLoading(true);

    try {
      // Es importante usar await si logIn retorna una Promesa
      await authContext?.logIn(data.username, data.password);
    } catch (error) {
      console.log(error);
    } finally {
      // Esto asegura que el loading se quite sin importar si hubo éxito o error
      setLoading(false);
    }
  };

  return (
    <View className="w-full flex-col gap-4">
      {/* --- CAMPO USUARIO --- */}
      <View className="w-full">
        <View
          className={`w-full flex-row items-center bg-white py-1 px-4 rounded-2xl border ${
            errors.username ? "border-red-500 bg-red-50" : "border-gray-200"
          } shadow-sm h-14`}
        >
          <Controller
            control={control}
            rules={{ required: "El usuario es requerido" }}
            name="username"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="Usuario"
                placeholderTextColor="#9ca3af" // gris más suave y moderno
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus={true}
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                className="flex-1 color-gray-900 bg-transparent text-base font-medium h-full"
              />
            )}
          />
        </View>
        {errors.username && (
          <Text className="text-red-500 text-xs mt-1 ml-2 font-bold tracking-wide">
            {errors.username.message}
          </Text>
        )}
      </View>

      {/* --- CAMPO CONTRASEÑA --- */}
      <View className="w-full">
        <View
          className={`w-full flex-row items-center bg-white py-1 px-4 rounded-2xl border relative ${
            errors.password ? "border-red-500 bg-red-50" : "border-gray-200"
          } shadow-sm h-14`}
        >
          <Controller
            control={control}
            rules={{ required: "La contraseña es requerida" }}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                ref={passwordInputRef}
                placeholder="Contraseña"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
                returnKeyType="done"
                secureTextEntry={!showPassword}
                onSubmitEditing={handleSubmit(onSubmit)}
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                className="flex-1 color-gray-900 bg-transparent text-base font-medium pr-10 h-full"
              />
            )}
          />

          <TouchableOpacity
            onPress={togglePasswordView}
            className="absolute right-3 p-2 items-center justify-center h-full"
            activeOpacity={0.7}
          >
            {showPassword ? (
              <FontAwesomeEyeOff props={{ size: 18, color: "#9ca3af" }} />
            ) : (
              <FontAwesomeEye props={{ size: 18, color: "#9ca3af" }} />
            )}
          </TouchableOpacity>
        </View>
        {errors.password && (
          <Text className="text-red-500 text-xs mt-1 ml-2 font-bold tracking-wide">
            {errors.password.message}
          </Text>
        )}
      </View>

      {/* --- BOTÓN INGRESAR --- */}
      <TouchableOpacity
        className={`mt-4 w-full h-14 flex-row items-center justify-center bg-primary rounded-2xl shadow-sm ${
          loading ? "opacity-70" : "active:opacity-80"
        }`}
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="font-extrabold color-white text-lg text-center tracking-widest uppercase">
            Ingresar
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
