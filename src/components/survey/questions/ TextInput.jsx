function TextInput({ question, value, onChange }) {
  return (
    <textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Type your answer here..."
      rows={3}
      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg
                 focus:border-blue-500 focus:outline-none resize-y"
    />
  );
}

export default TextInput;