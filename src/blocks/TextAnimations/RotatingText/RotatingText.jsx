"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from "react";

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

const RotatingText = forwardRef((props, ref) => {
  const {
    texts = [],
    transition = { type: "spring", damping: 25, stiffness: 300 },
    initial = { y: "100%", opacity: 0 },
    animate = { y: 0, opacity: 1 },
    exit = { y: "-120%", opacity: 0 },
    animatePresenceMode = "wait",
    animatePresenceInitial = false,
    rotationInterval = 2000,
    staggerDuration = 0,
    staggerFrom = "first", // 'first' | 'last' | 'center' | 'random' | number
    loop = true,
    auto = true,
    splitBy = "characters", // 'characters' | 'words' | 'lines' | custom splitter string
    onNext,
    mainClassName,
    splitLevelClassName,
    elementLevelClassName,
    ...rest
  } = props;

  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  // To keep 'random' staggerFrom stable between renders
  const randomOrderRef = useRef([]);

  const splitIntoCharacters = (text) => {
    if (typeof Intl !== "undefined" && Intl.Segmenter) {
      const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
      return Array.from(segmenter.segment(text), (segment) => segment.segment);
    }
    return Array.from(text);
  };

  // Prepare the elements to animate based on current text and splitBy
  const elements = useMemo(() => {
    if (!texts.length) return [];
    const currentText = texts[currentTextIndex];
    if (splitBy === "characters") {
      const words = currentText.split(" ");
      return words.map((word, i) => ({
        characters: splitIntoCharacters(word),
        needsSpace: i !== words.length - 1,
      }));
    }
    if (splitBy === "words") {
      return currentText.split(" ").map((word, i, arr) => ({
        characters: [word],
        needsSpace: i !== arr.length - 1,
      }));
    }
    if (splitBy === "lines") {
      return currentText.split("\n").map((line, i, arr) => ({
        characters: [line],
        needsSpace: i !== arr.length - 1,
      }));
    }
    // Custom splitter string
    return currentText.split(splitBy).map((part, i, arr) => ({
      characters: [part],
      needsSpace: i !== arr.length - 1,
    }));
  }, [texts, currentTextIndex, splitBy]);

  // Calculate stagger delay for each character index based on staggerFrom
  const getStaggerDelay = useCallback(
    (index, totalChars) => {
      if (staggerFrom === "first") return index * staggerDuration;
      if (staggerFrom === "last") return (totalChars - 1 - index) * staggerDuration;
      if (staggerFrom === "center") {
        const center = Math.floor(totalChars / 2);
        return Math.abs(center - index) * staggerDuration;
      }
      if (staggerFrom === "random") {
        // initialize random order once per text change
        if (randomOrderRef.current.length !== totalChars) {
          randomOrderRef.current = Array.from({ length: totalChars }, (_, i) => i)
            .sort(() => Math.random() - 0.5);
        }
        const randomIndex = randomOrderRef.current.indexOf(index);
        return randomIndex * staggerDuration;
      }
      // numeric index
      if (typeof staggerFrom === "number") {
        return Math.abs(staggerFrom - index) * staggerDuration;
      }
      return index * staggerDuration; // fallback
    },
    [staggerFrom, staggerDuration]
  );

  // Change text index and call callback if provided
  const handleIndexChange = useCallback(
    (newIndex) => {
      setCurrentTextIndex(newIndex);
      if (onNext) onNext(newIndex);
      // reset random order for new text
      randomOrderRef.current = [];
    },
    [onNext]
  );

  // Go to next text, respect loop flag
  const next = useCallback(() => {
    const nextIndex =
      currentTextIndex === texts.length - 1
        ? loop
          ? 0
          : currentTextIndex
        : currentTextIndex + 1;
    if (nextIndex !== currentTextIndex) {
      handleIndexChange(nextIndex);
    }
  }, [currentTextIndex, texts.length, loop, handleIndexChange]);

  // Go to previous text, respect loop flag
  const previous = useCallback(() => {
    const prevIndex =
      currentTextIndex === 0
        ? loop
          ? texts.length - 1
          : currentTextIndex
        : currentTextIndex - 1;
    if (prevIndex !== currentTextIndex) {
      handleIndexChange(prevIndex);
    }
  }, [currentTextIndex, texts.length, loop, handleIndexChange]);

  // Jump to specific text index
  const jumpTo = useCallback(
    (index) => {
      const validIndex = Math.max(0, Math.min(index, texts.length - 1));
      if (validIndex !== currentTextIndex) {
        handleIndexChange(validIndex);
      }
    },
    [texts.length, currentTextIndex, handleIndexChange]
  );

  // Reset to first text
  const reset = useCallback(() => {
    if (currentTextIndex !== 0) {
      handleIndexChange(0);
    }
  }, [currentTextIndex, handleIndexChange]);

  // Expose control functions to parent via ref
  useImperativeHandle(
    ref,
    () => ({
      next,
      previous,
      jumpTo,
      reset,
    }),
    [next, previous, jumpTo, reset]
  );

  // Handle auto rotation interval
  useEffect(() => {
    if (!auto) return;
    const intervalId = setInterval(next, rotationInterval);
    return () => clearInterval(intervalId);
  }, [next, rotationInterval, auto]);

  // Calculate total number of characters for stagger calculation
  const totalCharacters = elements.reduce(
    (sum, word) => sum + word.characters.length,
    0
  );

  return (
    <motion.span
      className={cn(
        "flex flex-wrap whitespace-pre-wrap relative",
        mainClassName
      )}
      {...rest}
      layout
      transition={transition}
    >
    
      <AnimatePresence mode={animatePresenceMode} initial={animatePresenceInitial}>
        <motion.div
          key={currentTextIndex}
          className={cn(
            splitBy === "lines"
              ? "flex flex-col w-full"
              : "flex flex-wrap whitespace-pre-wrap relative"
          )}
          layout
          aria-hidden="true"
        >
          {elements.map((wordObj, wordIndex, array) => {
            // Count previous characters to calculate stagger delay index
            const previousCharsCount = array
              .slice(0, wordIndex)
              .reduce((sum, word) => sum + word.characters.length, 0);
            return (
              <span key={wordIndex} className={cn("inline-flex", splitLevelClassName)}>
                {wordObj.characters.map((char, charIndex) => (
                  <motion.span
                    key={charIndex}
                    initial={initial}
                    animate={animate}
                    exit={exit}
                    transition={{
                      ...transition,
                      delay: getStaggerDelay(
                        previousCharsCount + charIndex,
                        totalCharacters
                      ),
                    }}
                    className={cn("inline-block", elementLevelClassName)}
                  >
                    {char}
                  </motion.span>
                ))}
                {wordObj.needsSpace && <span className="whitespace-pre"> </span>}
              </span>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </motion.span>
  );
});

RotatingText.displayName = "RotatingText";

export default RotatingText;
