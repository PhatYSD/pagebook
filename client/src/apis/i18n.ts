import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        lng: "en",
        debug: true,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
        resources: {
            en: {
                translation: {
                    login: "Login",
                    register: "Register",
                    username: "Username",
                    password: "Password",
                    repassword: "Repassword",
                    forgetPassword: "Forget Password?",
                    search: "Search",
                    welcomeToPagebook: "Welcome to Pagebook",
                    superSocialApplication: "Super Social application",
                    profile: "Profile",
                    setting: "Setting",
                    logout: "Logout",
                    title: "Title",
                    description: "Description",
                    selectaPhoto: "Select a photo",
                    close: "Close",
                    post: "Post",
                    fullContent: "Full content",
                    follow: "Follow",
                    delete: "Delete",
                    follower: "Follower",
                    following: "Following",
                    image: "Image",
                    profilePost: "Profile Post",
                    publicPost: "Public Post",
                    editProfile: "Edit Profile",
                    edit: "Edit",
                    likeHistory: "Like History",
                    oncomint: "Oncomint",
                    view: "View",
                    changeLanguage: "Change Language",
                    changePassword: "Change Password",
                    change: "Change",
                    newPassword: "New Password",
                    save: "Save",
                    deleteAccount: "Delete Account",
                    changeAvatar: "Change Avatar",
                    changeBackground: "Change Background",
                    back: "Back"
                }
            },
            th: {
                translation: {
                    login: "เข้าสู่ระบบ",
                    register: "ลงทะเบียน",
                    username: "ชื่อผู้ใช้",
                    password: "รหัสผ่าน",
                    repassword: "รหัสผ่านอีกครั้ง",
                    forgetPassword: "ลืมรหัสผ่าน ใช่หรือไม่?",
                    search: "ค้นหา",
                    welcomeToPagebook: "ยินดีต้อนรับสู่ Pagebook",
                    superSocialApplication: "สุงยอดแอพโซเซียล",
                    profile: "โปรไฟล์",
                    setting: "ตั้งค่า",
                    logout: "ออกจากระบบ",
                    title: "หัวข้อ",
                    description: "คำอธิบาย",
                    selectaPhoto: "เลือกรูปภาพ",
                    close: "ปิด",                
                    post: "โพสต์",
                    fullContent: "เนื้อหาเต็ม",
                    follow: "ติดตาม",
                    delete: "ลบ",
                    follower: "ผู้ติดตาม",
                    following: "กำลังติดตาม",
                    image: "รูปภาพ",
                    profilePost: "โพสต์บนโปรไฟล์",
                    publicPost: "โพสต์สาธารณะ",
                    editProfile: "แก้ไขโปรไฟล์",
                    edit: "แก้ไข",
                    likeHistory: "ประวัติการกดไลด์",
                    oncomint: "กำลังจะมาถึง",
                    view: "ดู",
                    changeLanguage: "เปลี่ยนภาษา",
                    changePassword: "เปลี่ยนรหัสผ่าน",
                    change: "เปลี่ยน",
                    newPassword: "รหัสผ่านใหม่",
                    save: "บันทึก",
                    deleteAccount: "ลบบัญชี",
                    changeProfile: "เปลี่ยนอวาตาร์",
                    changeBackground: "เปลี่ยนพื้นหลัง",
                    back: "กลับ"
                }
            }
        }
    });

export default i18n;