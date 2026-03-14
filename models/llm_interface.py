import torch
from transformers import AutoTokenizer, AutoModelForCausalLM


class LLMInterface:

    def __init__(self):

        model_name = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"

        self.device = "cuda" if torch.cuda.is_available() else "cpu"

        print(f"Loading model on {self.device}...")

        self.tokenizer = AutoTokenizer.from_pretrained(model_name)

        self.model = AutoModelForCausalLM.from_pretrained(
            model_name,
            torch_dtype=torch.float16 if self.device == "cuda" else torch.float16,
            device_map="auto"
        )

        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token

    def count_tokens(self, text):

        return len(self.tokenizer.encode(text))

    def generate(self, prompt, n=3, use_qa_template=True):

        if use_qa_template:
            # 💎 UPDATED: Using proper Chat Template to stop the model from echoing 💎
            messages = [
                {"role": "system", "content": "You are a highly efficient AI assistant. Answer the user's query directly and concisely."},
                {"role": "user", "content": prompt}
            ]
            # This formats the prompt exactly how TinyLlama was trained to see it
            prompt_text = self.tokenizer.apply_chat_template(
                messages, 
                tokenize=False, 
                add_generation_prompt=True
            )
        else:
            prompt_text = prompt

        prompts = [prompt_text] * n

        inputs = self.tokenizer(
            prompts,
            return_tensors="pt",
            padding=True,
            truncation=True
        ).to(self.device)

        input_length = inputs["input_ids"].shape[1]

        outputs = self.model.generate(
            **inputs,
            max_new_tokens=80,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
            pad_token_id=self.tokenizer.eos_token_id
        )

        responses = self.tokenizer.batch_decode(
            outputs[:, input_length:],
            skip_special_tokens=True
        )

        return [response.strip() for response in responses]
