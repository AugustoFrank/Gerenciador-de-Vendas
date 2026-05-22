import re
from django.core.exceptions import ValidationError

class SenhaForteValidator:
    def validate(self, password, user=None):
        if len(password) < 9:
            raise ValidationError("A senha deve ter pelo menos 9 caracteres.", code='password_too_short')
        
        if not re.search(r'[A-Z]', password):
            raise ValidationError("A senha deve conter pelo menos uma letra maiúscula.", code='password_no_upper')
            
        if not re.search(r'[a-z]', password):
            raise ValidationError("A senha deve conter pelo menos uma letra minúscula.", code='password_no_lower')
            
        if not re.search(r'\d', password):
            raise ValidationError("A senha deve conter pelo menos um número.", code='password_no_number')
            
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            raise ValidationError("A senha deve conter pelo menos um caractere especial (ex: ., *, %).", code='password_no_symbol')

    def get_help_text(self):
        return "Sua senha deve ter no mínimo 9 caracteres, incluindo letras maiúsculas, minúsculas, números e símbolos especiais."