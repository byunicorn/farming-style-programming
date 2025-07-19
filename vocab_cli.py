#!/usr/bin/env python3
"""
Command Line Interface for English Vocabulary Book
Interactive CLI for managing vocabulary learning and tracking progress.
"""

import argparse
import sys
from vocabulary_book import VocabularyBook, DifficultyLevel, LearningStatus
from datetime import datetime


class VocabularyBookCLI:
    def __init__(self):
        self.vocab_book = VocabularyBook()

    def add_word_interactive(self):
        """Interactive word addition"""
        print("\n--- Add New Word ---")
        word = input("Word: ").strip()
        if not word:
            print("Word cannot be empty!")
            return

        definition = input("Definition: ").strip()
        if not definition:
            print("Definition cannot be empty!")
            return

        pronunciation = input("Pronunciation (optional): ").strip()
        part_of_speech = input("Part of speech (noun/verb/adj/adv/etc.): ").strip()
        example = input("Example sentence: ").strip()
        
        print("Difficulty level:")
        print("1. Beginner")
        print("2. Intermediate") 
        print("3. Advanced")
        
        while True:
            try:
                choice = int(input("Choose difficulty (1-3): "))
                if choice == 1:
                    difficulty = DifficultyLevel.BEGINNER
                    break
                elif choice == 2:
                    difficulty = DifficultyLevel.INTERMEDIATE
                    break
                elif choice == 3:
                    difficulty = DifficultyLevel.ADVANCED
                    break
                else:
                    print("Please choose 1, 2, or 3")
            except ValueError:
                print("Please enter a number")

        notes = input("Notes (optional): ").strip()

        if self.vocab_book.add_word(word, definition, pronunciation, 
                                  part_of_speech, example, difficulty, notes):
            print(f"✓ Word '{word}' added successfully!")
        else:
            print(f"✗ Word '{word}' already exists!")

    def review_session(self):
        """Interactive review session"""
        words_to_review = self.vocab_book.get_words_for_review()
        
        if not words_to_review:
            print("No words need review right now. Great job!")
            return

        print(f"\n--- Review Session ({len(words_to_review)} words) ---")
        
        correct_count = 0
        reviewed_words = []
        
        for i, word in enumerate(words_to_review, 1):
            print(f"\n({i}/{len(words_to_review)}) Word: {word.word}")
            if word.pronunciation:
                print(f"Pronunciation: {word.pronunciation}")
            
            input("Press Enter to see definition...")
            print(f"Definition: {word.definition}")
            if word.example_sentence:
                print(f"Example: {word.example_sentence}")
            
            while True:
                response = input("Did you know it? (y/n): ").lower()
                if response in ['y', 'yes']:
                    correct = True
                    correct_count += 1
                    break
                elif response in ['n', 'no']:
                    correct = False
                    break
                else:
                    print("Please answer y or n")
            
            self.vocab_book.review_word(word.word, correct)
            reviewed_words.append(word.word)
            
            if correct:
                print("✓ Correct!")
            else:
                print("✗ Keep practicing!")

        accuracy = correct_count / len(words_to_review)
        time_spent = len(words_to_review) * 2  # Estimate 2 minutes per word
        
        self.vocab_book.record_daily_progress(
            words_learned=0,
            words_reviewed=len(words_to_review),
            time_spent_minutes=time_spent,
            accuracy_rate=accuracy,
            reviewed_words=reviewed_words
        )
        
        print(f"\n--- Review Complete ---")
        print(f"Score: {correct_count}/{len(words_to_review)} ({accuracy:.1%})")
        print(f"Time spent: ~{time_spent} minutes")

    def show_statistics(self):
        """Display learning statistics"""
        stats = self.vocab_book.get_statistics()
        
        print("\n--- Vocabulary Statistics ---")
        print(f"Total Words: {stats['total_words']}")
        print(f"New: {stats['new_words']}")
        print(f"Learning: {stats['learning_words']}")
        print(f"Reviewing: {stats['reviewing_words']}")
        print(f"Mastered: {stats['mastered_words']} ({stats['mastery_rate']:.1%})")
        print(f"Study Streak: {stats['study_streak']} days")
        print(f"Weekly Study Time: {stats['weekly_time_minutes']} minutes")
        print(f"Weekly Accuracy: {stats['weekly_accuracy']:.1%}")

    def search_words(self):
        """Search vocabulary words"""
        query = input("Enter search term: ").strip()
        if not query:
            return
        
        results = self.vocab_book.search_words(query)
        
        if not results:
            print("No words found!")
            return
        
        print(f"\n--- Search Results ({len(results)} found) ---")
        for word in results:
            print(f"\n{word.word} [{word.status.value}]")
            print(f"  {word.definition}")
            if word.example_sentence:
                print(f"  Example: {word.example_sentence}")

    def list_words_by_status(self):
        """List words by learning status"""
        print("\nChoose status:")
        print("1. New words")
        print("2. Learning")
        print("3. Reviewing")
        print("4. Mastered")
        
        try:
            choice = int(input("Choose (1-4): "))
            status_map = {
                1: LearningStatus.NEW,
                2: LearningStatus.LEARNING,
                3: LearningStatus.REVIEWING,
                4: LearningStatus.MASTERED
            }
            
            if choice not in status_map:
                print("Invalid choice!")
                return
            
            status = status_map[choice]
            words = [w for w in self.vocab_book.words.values() if w.status == status]
            
            if not words:
                print(f"No {status.value} words found!")
                return
            
            print(f"\n--- {status.value.upper()} Words ({len(words)}) ---")
            for word in sorted(words, key=lambda x: x.word):
                print(f"{word.word}: {word.definition}")
                
        except ValueError:
            print("Please enter a number!")

    def daily_goal_tracker(self):
        """Set and track daily learning goals"""
        today = datetime.now().strftime('%Y-%m-%d')
        
        if today in self.vocab_book.daily_progress:
            progress = self.vocab_book.daily_progress[today]
            print(f"\n--- Today's Progress ---")
            print(f"Words learned: {progress.words_learned}")
            print(f"Words reviewed: {progress.words_reviewed}")
            print(f"Time spent: {progress.time_spent_minutes} minutes")
            print(f"Accuracy: {progress.accuracy_rate:.1%}")
        else:
            print("\n--- Set Today's Goal ---")
            try:
                target_new = int(input("Target new words to learn: "))
                target_review = int(input("Target words to review: "))
                target_time = int(input("Target study time (minutes): "))
                
                print(f"\nGoal set! Learn {target_new} new words, review {target_review} words, study for {target_time} minutes.")
                
                # Simple goal tracking could be implemented here
            except ValueError:
                print("Please enter valid numbers!")

    def run_interactive_menu(self):
        """Main interactive menu"""
        while True:
            print("\n" + "=" * 50)
            print("📚 ENGLISH VOCABULARY BOOK")
            print("=" * 50)
            print("1. Add new word")
            print("2. Review words")
            print("3. View statistics")
            print("4. Search words")
            print("5. List words by status")
            print("6. Daily goal tracker")
            print("7. Export vocabulary")
            print("8. Exit")
            
            try:
                choice = int(input("\nChoose an option (1-8): "))
                
                if choice == 1:
                    self.add_word_interactive()
                elif choice == 2:
                    self.review_session()
                elif choice == 3:
                    self.show_statistics()
                elif choice == 4:
                    self.search_words()
                elif choice == 5:
                    self.list_words_by_status()
                elif choice == 6:
                    self.daily_goal_tracker()
                elif choice == 7:
                    filename = input("Export filename (or press Enter for default): ").strip()
                    if filename:
                        self.vocab_book.export_to_txt(filename)
                    else:
                        self.vocab_book.export_to_txt()
                elif choice == 8:
                    print("Happy learning! 📖")
                    break
                else:
                    print("Please choose a number between 1-8")
                    
            except ValueError:
                print("Please enter a valid number!")
            except KeyboardInterrupt:
                print("\n\nGoodbye! 👋")
                break


def main():
    parser = argparse.ArgumentParser(description="English Vocabulary Book CLI")
    parser.add_argument('--add', nargs='+', help="Add word: --add word definition")
    parser.add_argument('--review', action='store_true', help="Start review session")
    parser.add_argument('--stats', action='store_true', help="Show statistics")
    parser.add_argument('--search', help="Search words")
    parser.add_argument('--export', nargs='?', const='', help="Export to file")
    
    args = parser.parse_args()
    
    cli = VocabularyBookCLI()
    
    if args.add:
        if len(args.add) < 2:
            print("Usage: --add <word> <definition> [pronunciation] [part_of_speech] [example]")
            return
        
        word = args.add[0]
        definition = args.add[1]
        pronunciation = args.add[2] if len(args.add) > 2 else ""
        part_of_speech = args.add[3] if len(args.add) > 3 else ""
        example = " ".join(args.add[4:]) if len(args.add) > 4 else ""
        
        if cli.vocab_book.add_word(word, definition, pronunciation, part_of_speech, example):
            print(f"✓ Word '{word}' added successfully!")
        else:
            print(f"✗ Word '{word}' already exists!")
    
    elif args.review:
        cli.review_session()
    
    elif args.stats:
        cli.show_statistics()
    
    elif args.search:
        results = cli.vocab_book.search_words(args.search)
        if results:
            print(f"Found {len(results)} words:")
            for word in results:
                print(f"{word.word}: {word.definition}")
        else:
            print("No words found!")
    
    elif args.export is not None:
        filename = args.export if args.export else None
        cli.vocab_book.export_to_txt(filename)
    
    else:
        cli.run_interactive_menu()


if __name__ == "__main__":
    main()