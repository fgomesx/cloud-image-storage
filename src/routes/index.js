import React from 'react';
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from '@expo/vector-icons';
import Gallery from "../pages/Gallery"
import Upload from "../pages/Upload"

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function Routes() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="Gallery"
                component={TabRoutes}
                options={{ headerShown: false }}
            />

            <Stack.Screen
                name="Upload"
                component={Upload}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    )
}

function TabRoutes() { //Barra de navegação inferior

    return (
        <Tab.Navigator
            screenOptions={{
                tabBarActiveTintColor: '#000000',
                tabBarInactiveTintColor: '#A1A1A1',
                tabBarStyle: {
                    position: 'fixed',
                    backgroundColor: '#F8F8FF',
                }
            }}
        >
            <Tab.Screen
                name="Galeria"
                component={Gallery}
                options={{
                    headerTitleAlign: 'center',
                    headerTitle: 'Galeria de Imagens',
                    tabBarIcon: ({ color, size, focused }) => {
                        if (focused) {
                            return <Ionicons name="images" size={size} color={color} />
                        }
                        return <Ionicons name="images-outline" size={size} color={color} />
                    }
                }}
            />

            <Tab.Screen
                name="Carregar"
                component={Upload}
                options={{
                    headerTitleAlign: 'center',
                    headerTitle: 'Carregar imagens',
                    tabBarIcon: ({ color, size, focused }) => {
                        if (focused) {
                            return <Ionicons name="cloud-upload" size={size} color={color} />
                        }
                        return <Ionicons name="cloud-upload-outline" size={size} color={color} />
                    }
                }}
            />
        </Tab.Navigator>
    )
}