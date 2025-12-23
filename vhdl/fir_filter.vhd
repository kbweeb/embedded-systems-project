-------------------------------------------------------------------------------
-- FIR Filter Implementation
-- 8-tap low-pass FIR filter for signal processing
-- 
-- This demonstrates basic VHDL concepts:
-- - Entity/Architecture
-- - Sequential logic (process)
-- - Shift registers
-- - Fixed-point arithmetic
-------------------------------------------------------------------------------

library IEEE;
use IEEE.STD_LOGIC_1164.ALL;
use IEEE.NUMERIC_STD.ALL;

entity fir_filter is
    generic (
        DATA_WIDTH : integer := 16;  -- Input/output data width
        COEF_WIDTH : integer := 16;  -- Coefficient width
        NUM_TAPS   : integer := 8    -- Number of filter taps
    );
    port (
        clk        : in  std_logic;
        reset      : in  std_logic;
        data_in    : in  signed(DATA_WIDTH-1 downto 0);
        data_valid : in  std_logic;
        data_out   : out signed(DATA_WIDTH-1 downto 0);
        out_valid  : out std_logic
    );
end entity fir_filter;

architecture Behavioral of fir_filter is
    
    -- Filter coefficients (pre-computed low-pass filter)
    -- Normalized and scaled to fixed-point
    type coef_array is array (0 to NUM_TAPS-1) of signed(COEF_WIDTH-1 downto 0);
    constant coefficients : coef_array := (
        to_signed(1024, COEF_WIDTH),   -- h[0]
        to_signed(2048, COEF_WIDTH),   -- h[1]
        to_signed(4096, COEF_WIDTH),   -- h[2]
        to_signed(6144, COEF_WIDTH),   -- h[3]
        to_signed(6144, COEF_WIDTH),   -- h[4]
        to_signed(4096, COEF_WIDTH),   -- h[5]
        to_signed(2048, COEF_WIDTH),   -- h[6]
        to_signed(1024, COEF_WIDTH)    -- h[7]
    );
    
    -- Delay line (shift register)
    type delay_line_type is array (0 to NUM_TAPS-1) of signed(DATA_WIDTH-1 downto 0);
    signal delay_line : delay_line_type := (others => (others => '0'));
    
    -- Internal signals
    signal accumulator : signed(DATA_WIDTH + COEF_WIDTH + 3 downto 0);
    signal output_reg  : signed(DATA_WIDTH-1 downto 0);
    signal valid_reg   : std_logic;
    
begin
    
    -- Main filter process
    filter_process : process(clk, reset)
        variable acc : signed(DATA_WIDTH + COEF_WIDTH + 3 downto 0);
    begin
        if reset = '1' then
            -- Asynchronous reset
            delay_line <= (others => (others => '0'));
            output_reg <= (others => '0');
            valid_reg  <= '0';
            
        elsif rising_edge(clk) then
            valid_reg <= '0';
            
            if data_valid = '1' then
                -- Shift delay line
                for i in NUM_TAPS-1 downto 1 loop
                    delay_line(i) <= delay_line(i-1);
                end loop;
                delay_line(0) <= data_in;
                
                -- Compute FIR output: y[n] = sum(h[k] * x[n-k])
                acc := (others => '0');
                for i in 0 to NUM_TAPS-1 loop
                    acc := acc + (delay_line(i) * coefficients(i));
                end loop;
                
                -- Scale output (divide by sum of coefficients)
                -- Right shift by 15 bits (coefficients sum to ~32768)
                output_reg <= acc(DATA_WIDTH + 14 downto 15);
                valid_reg  <= '1';
            end if;
        end if;
    end process filter_process;
    
    -- Output assignments
    data_out  <= output_reg;
    out_valid <= valid_reg;
    
end architecture Behavioral;

-------------------------------------------------------------------------------
-- Testbench (for simulation)
-------------------------------------------------------------------------------

library IEEE;
use IEEE.STD_LOGIC_1164.ALL;
use IEEE.NUMERIC_STD.ALL;

entity fir_filter_tb is
end entity fir_filter_tb;

architecture test of fir_filter_tb is
    
    signal clk        : std_logic := '0';
    signal reset      : std_logic := '1';
    signal data_in    : signed(15 downto 0) := (others => '0');
    signal data_valid : std_logic := '0';
    signal data_out   : signed(15 downto 0);
    signal out_valid  : std_logic;
    
    constant CLK_PERIOD : time := 10 ns;
    
begin
    
    -- Instantiate DUT
    DUT : entity work.fir_filter
        port map (
            clk        => clk,
            reset      => reset,
            data_in    => data_in,
            data_valid => data_valid,
            data_out   => data_out,
            out_valid  => out_valid
        );
    
    -- Clock generation
    clk_process : process
    begin
        clk <= '0';
        wait for CLK_PERIOD/2;
        clk <= '1';
        wait for CLK_PERIOD/2;
    end process;
    
    -- Stimulus
    stim_process : process
    begin
        -- Reset
        reset <= '1';
        wait for CLK_PERIOD * 5;
        reset <= '0';
        wait for CLK_PERIOD * 2;
        
        -- Apply impulse
        data_in <= to_signed(1000, 16);
        data_valid <= '1';
        wait for CLK_PERIOD;
        
        -- Apply zeros to see impulse response
        data_in <= to_signed(0, 16);
        for i in 0 to 15 loop
            wait for CLK_PERIOD;
        end loop;
        
        -- Apply step
        data_in <= to_signed(500, 16);
        for i in 0 to 15 loop
            wait for CLK_PERIOD;
        end loop;
        
        data_valid <= '0';
        wait for CLK_PERIOD * 10;
        
        -- End simulation
        assert false report "Simulation Complete" severity failure;
    end process;
    
end architecture test;
