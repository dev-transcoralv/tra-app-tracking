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
    <View className="w-full flex flex-col gap-4">
      {/* --- CAMPO USUARIO --- */}
      <View className="w-full">
        <View
          className={`w-full flex-row items-center bg-secondary-complementary p-3 rounded-md ${errors.username ? "border border-red-500" : ""}`}
        >
          <Controller
            control={control}
            rules={{ required: "El usuario es requerido" }}
            name="username"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                placeholder="Usuario"
                placeholderTextColor="#5c5c5c" // Color más suave
                autoCapitalize="none" // Importante para logins
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()} // Salta al siguiente campo
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                className="flex-1 color-secondary bg-transparent text-sm md:text-base"
              />
            )}
          />
        </View>
        {errors.username && (
          <Text className="text-primary text-xs mt-1 font-bold">
            {errors.username.message}
          </Text>
        )}
      </View>

      {/* --- CAMPO CONTRASEÑA --- */}
      <View className="w-full">
        <View
          className={`w-full flex-row items-center bg-secondary-complementary p-3 rounded-md relative ${errors.password ? "border border-red-500" : ""}`}
        >
          <Controller
            control={control}
            rules={{ required: "La contraseña es requerida" }}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                ref={passwordInputRef} // Asignamos la referencia
                placeholder="Contraseña"
                placeholderTextColor="#5c5c5c"
                autoCapitalize="none"
                returnKeyType="done"
                secureTextEntry={!showPassword}
                onSubmitEditing={handleSubmit(onSubmit)} // Envía el form al dar Enter
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                className="flex-1 color-secondary bg-transparent text-sm md:text-base pr-8"
              />
            )}
          />

          {/* Botón Ojo: Absolute position para que no mueva el input */}
          <TouchableOpacity
            onPress={togglePasswordView}
            className="absolute right-3 p-2"
            activeOpacity={0.7}
          >
            {showPassword ? (
              <FontAwesomeEyeOff props={{ size: 20, color: "#211915" }} />
            ) : (
              <FontAwesomeEye props={{ size: 20, color: "#211915" }} />
            )}
          </TouchableOpacity>
        </View>
        {errors.password && (
          <Text className="text-red-500 text-xs mt-1 ml-1">
            {errors.password.message}
          </Text>
        )}
      </View>

      {/* --- BOTÓN INGRESAR --- */}
      <TouchableOpacity
        className={`mt-2 px-5 py-3 items-center justify-center bg-primary rounded-md ${loading ? "opacity-70" : ""}`}
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="font-bold color-white text-lg text-center">
            INGRESAR
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
