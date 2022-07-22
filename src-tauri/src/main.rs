#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

type Grid = Vec<Vec<bool>>;

#[tauri::command]
fn reset_grid(cells_per_row: u32, cells_per_column: u32) -> Grid {
  println!("Resetting grid to {}x{}", cells_per_row, cells_per_column);

  return vec![vec![false; cells_per_column as usize]; cells_per_row as usize];
}

#[tauri::command]
fn set_cell(grid: Grid, row: u32, column: u32, value: bool) -> Grid {
  println!("Setting cell at ({}, {}) to {}", row, column, value);

  let mut new_grid = grid.clone();
  new_grid[row as usize][column as usize] = value;

  return new_grid;
}

#[tauri::command]
fn tick(grid: Grid) -> Grid {
  println!("Ticking grid");

  let mut new_grid = grid.clone();

  // Iterate over each cell in the grid
  for row in 0..grid.len() {
    for column in 0..grid[row].len() {
      let mut neighbors = 0;
      // Check all 8 neighbors
      for i in -1..2 {
        for j in -1..2 {
          // Skip the current cell
          if i == 0 && j == 0 {
            continue;
          }
          // Get the neighbor's coordinates
          let neighbor_row = (row as i32 + i) as usize;
          let neighbor_column = (column as i32 + j) as usize;

          // Skip out-of-bounds neighbors
          if neighbor_row < grid.len() && neighbor_column < grid[row].len() {
            // Increment the neighbor's count if it's alive
            neighbors += grid[neighbor_row][neighbor_column] as i32;
          }
        }
      }

      // Rules
      // http://pi.math.cornell.edu/~lipa/mec/lesson6.html#:~:text=For%20each%20generation%20of%20the,it%20has%203%20live%20neighbors
      if neighbors < 2 || neighbors > 3 {
        new_grid[row][column] = false;
      } else if neighbors == 3 {
        new_grid[row][column] = true;
      }
    }
  }

  return new_grid;
}

#[tauri::command]
fn randomize(cells_per_row: u32, cells_per_column: u32) -> Grid {
  println!("Randomizing grid");

  let mut grid = reset_grid(cells_per_row, cells_per_column);
  for row in 0..grid.len() {
    for column in 0..grid[row].len() {
      grid[row][column] = rand::random();
    }
  }

  return grid;
}


fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![reset_grid, set_cell, tick, randomize])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
