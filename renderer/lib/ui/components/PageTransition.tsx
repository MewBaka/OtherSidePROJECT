"use client";

import clsx from 'clsx';
import {motion} from 'framer-motion';

const pageVariants = {
    initial: {
        opacity: 1,
        backgroundColor: "#000",
    },
    in: {
        opacity: 1,
        backgroundColor: "transparent",
        transition: {
            duration: 1,
            type: "tween",
            ease: "easeInOut",
        }
    },
    out: {
        opacity: 1,
        backgroundColor: "#000",
        transition: {
            duration: 1,
            type: "tween",
            ease: "easeInOut",
        }
    }
};

const PageTransition = ({children, className}) => (
    <motion.div
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        className={clsx(className)}
        style={{position: 'absolute', width: '100%', height: '100%'}}
    >
        {children}
    </motion.div>
);

export default PageTransition;