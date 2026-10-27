"""Regression coverage for safe inline roster data replacement."""
import unittest
import mm_data


class LiteralReplacementTests(unittest.TestCase):
    def test_empty_map_does_not_replace_state_or_catch_body(self):
        source = 'const state = {}; try {} catch(e){}\nconst PHOTO_META = {};\nconst tail = {};'
        replacement = '{"images/roster/example/1.jpg": {"date": "2026"}}'
        result = mm_data.replace_literal(source, 'PHOTO_META', replacement)
        self.assertEqual(result, source.replace('const PHOTO_META = {};', 'const PHOTO_META = '+replacement+';'))
        self.assertEqual(mm_data.extract_literal(result, 'PHOTO_META'), replacement)

    def test_equal_values_in_two_declarations(self):
        source = "const first = {'x': ['brace } in a string']}; const second = {'x': ['brace } in a string']};"
        result = mm_data.replace_literal(source, 'second', '{}')
        self.assertEqual(result, "const first = {'x': ['brace } in a string']}; const second = {};")


if __name__ == '__main__':
    unittest.main()
