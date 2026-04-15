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
          className={`w-full flex-row items-center py-2 px-5 rounded-[24px] border-2 ${
            errors.username
              ? "border-red-400 bg-red-50"
              : "border-slate-100 bg-slate-50"
          } h-16`}
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
                className="flex-1 color-slate-900 bg-transparent text-lg font-bold h-full tracking-wide"
              />
            )}
          />
        </View>
        {errors.username && (
          <Text className="text-red-500 text-xs mt-2 ml-4 font-bold tracking-widest uppercase">
            {errors.username.message}
          </Text>
        )}
      </View>

      {/* --- CAMPO CONTRASEÑA --- */}
      <View className="w-full">
        <View
          className={`w-full flex-row items-center py-2 px-5 rounded-[24px] border-2 relative ${
            errors.password
              ? "border-red-400 bg-red-50"
              : "border-slate-100 bg-slate-50"
          } h-16`}
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
                className="flex-1 color-slate-900 bg-transparent text-lg font-bold pr-12 h-full tracking-wide"
              />
            )}
          />

          <TouchableOpacity
            onPress={togglePasswordView}
            className="absolute right-4 p-2 items-center justify-center h-full"
            activeOpacity={0.7}
          >
            {showPassword ? (
              <FontAwesomeEyeOff props={{ size: 20, color: "#64748b" }} />
            ) : (
              <FontAwesomeEye props={{ size: 20, color: "#64748b" }} />
            )}
          </TouchableOpacity>
        </View>
        {errors.password && (
          <Text className="text-red-500 text-xs mt-2 ml-4 font-bold tracking-widest uppercase">
            {errors.password.message}
          </Text>
        )}
      </View>

      {/* --- BOTÓN INGRESAR --- */}
      <TouchableOpacity
        className={`mt-6 w-full h-16 flex-row items-center justify-center bg-primary rounded-[24px] shadow-sm ${
          loading ? "opacity-70" : "active:bg-red-800"
        }`}
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text className="font-black color-white text-base text-center tracking-[3px] uppercase">
            Iniciar Sesión
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
