/* eslint-disable prettier/prettier */
import {
  Text,
  TextInput,
  View,
  Button,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { AuthContext } from "../utils/authContext";
import { useContext, useState } from "react";
import { FontAwesomeEye, FontAwesomeEyeOff } from "../components/Icons";

type FormData = {
  username: string;
  password: string;
};

export default function LoginForm() {
  const authContext = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const togglePasswordView = () => setShowPassword(!showPassword);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const onSubmit: any = handleSubmit((data) =>
    authContext.logIn(data.username, data.password)
  );

  return (
    <View className="w-full flex flex-col gap-3">
      <View className="w-full flex items-center gap-2 bg-gray-800 p-2 rounded-xl">
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Usuario"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholderTextColor="white"
              className="color-white bg-transparent border-0 w-full outline-none text-sm md:text-base"
            />
          )}
          name="username"
        />
      </View>
      {errors.username && (
        <Text style={styles.error}>Este campo es requerido.</Text>
      )}
      <View className="w-full flex-row items-center gap-2 bg-gray-800 p-2 rounded-xl relative">
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              placeholder="Contraseña"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              secureTextEntry={!showPassword}
              placeholderTextColor="white"
              className="color-white flex-1 bg-transparent border-0 w-full outline-none text-sm md:text-base"
            />
          )}
          name="password"
        />
        <TouchableOpacity onPress={() => togglePasswordView()}>
          {showPassword ? (
            <FontAwesomeEyeOff props={{ size: 10 }} />
          ) : (
            <FontAwesomeEye />
          )}
        </TouchableOpacity>
      </View>
      {errors.password && (
        <Text style={styles.error}>Este campo es requerido.</Text>
      )}
      <Button
        title="Ingresar"
        color="#e10718"
        onPress={handleSubmit(onSubmit)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  error: {
    color: "red",
  },
});
