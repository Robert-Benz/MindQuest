function CustomSelect({ value, onChange, placeholder, options, icon: Icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative w-full text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between pl-11 pr-4 py-3.5 bg-slate-50/80 hover:bg-slate-100/80 border ${
          isOpen ? "border-peach-400 ring-4 ring-peach-400/20" : "border-slate-200"
        } rounded-2xl transition-all duration-300 outline-none shadow-sm`}
      >
        {Icon && (
          <Icon 
            className={`absolute left-4 top-1/2 -translate-y-1/2 size-5 transition-colors duration-300 ${
              isOpen || selectedOption ? "text-peach-500" : "text-gray-400"
            }`} 
          />
        )}
        <span className={`text-sm ${selectedOption ? "text-gray-700 font-semibold" : "text-gray-400"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className={`size-4 transition-all duration-300 ${
            isOpen ? "rotate-180 text-peach-500" : "text-gray-400"
          }`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 8, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 w-full bg-white/95 backdrop-blur-xl border border-slate-100 rounded-[1.25rem] shadow-xl shadow-peach-900/5 max-h-60 overflow-y-auto p-2 flex flex-col gap-1 min-w-[200px]"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-sm rounded-xl transition-all duration-200 block ${
                  value === opt.value
                    ? "bg-gradient-to-r from-peach-100 to-peach-50 text-peach-700 font-bold shadow-sm"
                    : "text-gray-600 hover:bg-peach-50/50 hover:text-peach-600 font-medium"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}