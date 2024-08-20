import {useEffect, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import Image from 'next/image';
import logo from '@/public/static/images/mewbaka.png';
import Warning from "@/public/static/images/warning.png";

const SplashScreen = () => {
    const [showLogo, setShowLogo] = useState(false);
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        const timerHandler = async () => {
            setShowLogo(true);
            await new Promise(resolve => setTimeout(resolve, 3000));
            setShowLogo(false);
            await new Promise(resolve => setTimeout(resolve, 2000));
            setShowWarning(true);
            await new Promise(resolve => setTimeout(resolve, 3000));
            setShowWarning(false);
            await new Promise(resolve => setTimeout(resolve, 2000));
            // total time: 10s
        };

        timerHandler();

        return () => {
            setShowLogo(false);
            setShowWarning(false);
        };
    }, []);

    return (
        <div className="inset-0 z-50 flex items-center justify-center bg-white h-full">
            <AnimatePresence>
                {showLogo && (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        transition={{duration: 1.5}}
                        className="flex items-center justify-center"
                        style={{height: '30vh', width: '30vw'}}
                    >
                        <Image src={logo} alt="Logo" className="object-contain"/>
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {showWarning && (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        transition={{duration: 1.5}}
                        className="flex items-center justify-center"
                        style={{height: '60vh', width: '60vw'}}
                    >
                        <Image src={Warning} alt="Warning" className="object-contain"/>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SplashScreen;